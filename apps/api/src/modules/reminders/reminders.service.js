import {
  cancelPendingReminder,
  cancelReminder,
  createPendingReminder,
  findOpenReminders,
  findReminderByAppointment,
  findReminderCandidates,
  findReminderConfigurations,
  findRemindersByClinic,
  updatePendingReminder,
} from "./reminders.repository.js";

const ACTIVE_APPOINTMENT_STATES = [
  "PROGRAMADA",
  "CONFIRMADA",
];

const REMINDER_STATES = [
  "PENDIENTE",
  "PROCESANDO",
  "ENVIADO",
  "ERROR",
  "CANCELADO",
];

/*
 * ============================================================
 * FORMATEAR RECORDATORIO
 * ============================================================
 */

function formatReminder(reminder) {
  return {
    id_recordatorio:
      reminder.id_recordatorio.toString(),

    id_clinica:
      reminder.id_clinica.toString(),

    id_cita:
      reminder.id_cita.toString(),

    tipo:
      reminder.tipo,

    programado_para:
      reminder.programado_para,

    estado:
      reminder.estado,

    intentos:
      reminder.intentos,

    ultimo_intento:
      reminder.ultimo_intento,

    enviado_en:
      reminder.enviado_en,

    ultimo_error:
      reminder.ultimo_error,

    provider_message_id:
      reminder.provider_message_id,

    fecha_creacion:
      reminder.fecha_creacion,

    fecha_actualizacion:
      reminder.fecha_actualizacion,

    cita:
      reminder.citas
        ? {
            id_cita:
              reminder.citas.id_cita.toString(),

            id_paciente:
              reminder.citas.id_paciente.toString(),

            fecha_hora_inicio:
              reminder.citas.fecha_hora_inicio,

            fecha_hora_fin:
              reminder.citas.fecha_hora_fin,

            estado:
              reminder.citas.estado,

            motivo:
              reminder.citas.motivo,

            paciente:
              reminder.citas.pacientes
                ? {
                    id_paciente:
                      reminder.citas.pacientes.id_paciente.toString(),

                    nombres:
                      reminder.citas.pacientes.nombres,

                    apellidos:
                      reminder.citas.pacientes.apellidos,

                    telefono:
                      reminder.citas.pacientes.telefono,
                  }
                : null,
          }
        : null,
  };
}

/*
 * ============================================================
 * ERROR DE ESTADO
 * ============================================================
 */

function createReminderStateError(message) {
  const error =
    new Error(message);

  error.statusCode =
    400;

  error.code =
    "INVALID_REMINDER_STATE";

  return error;
}

/*
 * ============================================================
 * SINCRONIZAR RECORDATORIOS
 * ============================================================
 *
 * Esta función NO ENVÍA WHATSAPP.
 *
 * Solamente determina qué citas necesitan
 * un recordatorio y registra el trabajo pendiente.
 *
 * IMPORTANTE:
 *
 * Actualmente solamente se consideran elegibles
 * las clínicas que tengan:
 *
 * proveedor = MOCK
 * activo = true
 *
 * Meta todavía no está habilitado.
 */

export async function synchronizeAppointmentReminders({
  now = new Date(),
} = {}) {
  /*
   * ==========================================================
   * OBTENER CONFIGURACIONES
   * ==========================================================
   */

  const configurations =
    await findReminderConfigurations();

  /*
   * ==========================================================
   * FILTRAR CLÍNICAS ELEGIBLES
   * ==========================================================
   *
   * Una clínica solamente puede generar recordatorios si:
   *
   * 1. Tiene configuración de WhatsApp.
   * 2. Está activa.
   * 3. El proveedor configurado es MOCK.
   *
   * META queda bloqueado por ahora.
   */

  const eligibleConfigurations =
    configurations.filter(
      (configuration) => {
        const whatsapp =
          configuration
            .clinicas
            ?.configuracion_whatsapp;

        const provider =
          String(
            whatsapp?.proveedor || ""
          )
            .trim()
            .toUpperCase();

        return (
          whatsapp?.activo ===
            true &&
          provider ===
            "MOCK"
        );
      }
    );

  /*
   * IDs de las clínicas que actualmente
   * pueden generar recordatorios.
   */

  const eligibleClinicIds =
    eligibleConfigurations.map(
      (configuration) =>
        configuration.id_clinica
    );

  /*
   * ==========================================================
   * SI NO HAY CLÍNICAS ELEGIBLES
   * ==========================================================
   *
   * Aunque no existan clínicas elegibles, debemos revisar
   * recordatorios que hayan quedado abiertos anteriormente.
   *
   * Por ejemplo:
   *
   * ayer:
   *   MOCK + activo = true
   *
   * hoy:
   *   META + activo = false
   *
   * El recordatorio anterior debe cancelarse.
   */

  if (
    !eligibleConfigurations.length
  ) {
    const cancelled =
      await cancelInvalidReminders({
        now,

        eligibleClinicIds: [],
      });

    return {
      scanned: 0,

      created: 0,

      updated: 0,

      cancelled,

      skipped: 0,
    };
  }

  /*
   * ==========================================================
   * CREAR MAPA:
   *
   * clínica → horas de anticipación
   * ==========================================================
   */

  const configurationByClinic =
    new Map(
      eligibleConfigurations.map(
        (configuration) => [
          configuration.id_clinica.toString(),

          configuration.horas_recordatorio,
        ]
      )
    );

  /*
   * ==========================================================
   * BUSCAR EL MÁXIMO DE HORAS CONFIGURADO
   * ==========================================================
   *
   * Esto nos permite saber hasta qué momento futuro
   * necesitamos consultar citas.
   */

  const maxReminderHours =
    Math.max(
      ...eligibleConfigurations.map(
        (configuration) =>
          configuration.horas_recordatorio
      )
    );

  /*
   * ==========================================================
   * HORIZONTE DE PLANIFICACIÓN
   * ==========================================================
   *
   * Agregamos 24 horas adicionales para detectar
   * correctamente citas cuyo recordatorio todavía
   * no ha llegado.
   */

  const PLANNING_HORIZON_HOURS =
    24;

  /*
   * ==========================================================
   * BUSCAR CITAS FUTURAS
   * ==========================================================
   */

  const candidates =
    await findReminderCandidates({
      clinicIds:
        eligibleClinicIds,

      from:
        now,

      to:
        new Date(
          now.getTime() +
            (
              maxReminderHours +
              PLANNING_HORIZON_HOURS
            ) *
              60 *
              60 *
              1000
        ),
    });

  let created = 0;

  let updated = 0;

  let skipped = 0;

  /*
   * ==========================================================
   * PROCESAR CADA CITA
   * ==========================================================
   */

  for (
    const appointment
    of candidates
  ) {
    /*
     * Buscar cuántas horas antes debe enviarse
     * el recordatorio para esta clínica.
     */

    const hours =
      configurationByClinic.get(
        appointment.id_clinica.toString()
      );

    /*
     * Si por alguna razón no encontramos
     * configuración para la clínica, omitimos
     * la cita.
     */

    if (
      hours === undefined ||
      hours < 0
    ) {
      skipped += 1;

      continue;
    }

    /*
     * ========================================================
     * CALCULAR MOMENTO DEL RECORDATORIO
     * ========================================================
     *
     * Ejemplo:
     *
     * cita:             10:00
     * recordatorio:     1 hora antes
     *
     * programado_para:  09:00
     *
     * IMPORTANTE:
     *
     * Aunque programadoPara ya haya pasado, NO
     * descartamos la cita.
     *
     * Esto permite que una cita creada después de la
     * hora ideal del recordatorio todavía pueda recibir
     * su recordatorio.
     *
     * Ejemplo:
     *
     * cita:             12:00
     * recordatorio:     1 hora antes
     * hora de creación: 11:40
     *
     * programado_para:  11:00
     *
     * Como la cita todavía no ha ocurrido, creamos
     * el recordatorio como PENDIENTE.
     *
     * El worker podrá detectarlo inmediatamente porque
     * programado_para ya es menor o igual que now.
     */

    const programadoPara =
      new Date(
        appointment.fecha_hora_inicio.getTime() -
          hours *
            60 *
            60 *
            1000
      );

    /*
     * ========================================================
     * VERIFICAR SI YA EXISTE RECORDATORIO
     * ========================================================
     */

    const previous =
      await findReminderByAppointment({
        idClinica:
          appointment.id_clinica,

        idCita:
          appointment.id_cita,
      });

    /*
     * ========================================================
     * CREAR RECORDATORIO NUEVO
     * ========================================================
     *
     * IMPORTANTE:
     *
     * No comprobamos aquí si programadoPara ya pasó.
     *
     * Si la cita todavía es futura y no existe recordatorio,
     * se crea como PENDIENTE.
     */

    if (!previous) {
      await createPendingReminder({
        idClinica:
          appointment.id_clinica,

        idCita:
          appointment.id_cita,

        programadoPara,
      });

      created += 1;

      continue;
    }

    /*
     * ========================================================
     * RECORDATORIO YA ENVIADO
     * ========================================================
     *
     * Si ya fue enviado, no lo volvemos a poner
     * como pendiente.
     */

    if (
      previous.estado ===
      "ENVIADO"
    ) {
      skipped += 1;

      continue;
    }

    /*
     * ========================================================
     * RECORDATORIO EN PROCESO
     * ========================================================
     *
     * El worker ya está trabajando con este
     * recordatorio.
     *
     * El planificador NO debe modificarlo.
     */

    if (
      previous.estado ===
      "PROCESANDO"
    ) {
      skipped += 1;

      continue;
    }

    /*
     * ========================================================
     * RECORDATORIO CON ERROR
     * ========================================================
     *
     * Si el envío falló y la fecha programada
     * sigue siendo la misma, dejamos que el worker
     * controle los reintentos.
     *
     * NO debemos convertir ERROR → PENDIENTE
     * cada 60 segundos.
     */

    if (
      previous.estado ===
        "ERROR" &&
      previous.programado_para.getTime() ===
        programadoPara.getTime()
    ) {
      skipped += 1;

      continue;
    }

    /*
     * ========================================================
     * RECORDATORIO PENDIENTE SIN CAMBIOS
     * ========================================================
     *
     * Si ya está pendiente y la fecha no cambió,
     * no hacemos nada.
     *
     * Esto también aplica cuando programadoPara ya pasó.
     * En ese caso el worker es quien debe procesarlo.
     */

    if (
      previous.estado ===
        "PENDIENTE" &&
      previous.programado_para.getTime() ===
        programadoPara.getTime()
    ) {
      skipped += 1;

      continue;
    }

    /*
     * ========================================================
     * CITA REPROGRAMADA
     * ========================================================
     *
     * Si la fecha calculada cambió, actualizamos
     * el recordatorio.
     *
     * Esto permite que una cita reprogramada
     * tenga nuevamente un recordatorio pendiente.
     */

    await updatePendingReminder({
      idRecordatorio:
        previous.id_recordatorio,

      programadoPara,
    });

    updated += 1;
  }

  /*
   * ==========================================================
   * CANCELAR RECORDATORIOS INVÁLIDOS
   * ==========================================================
   *
   * Aquí revisamos recordatorios que ya existían pero
   * que dejaron de ser válidos.
   *
   * Por ejemplo:
   *
   * - WhatsApp fue desactivado.
   * - Se cambió MOCK por META.
   * - Se eliminó la configuración.
   * - La cita fue cancelada.
   * - La cita pasó a NO_ASISTIO.
   * - La cita ya pasó.
   */

  const cancelled =
    await cancelInvalidReminders({
      now,

      eligibleClinicIds,
    });

  /*
   * ==========================================================
   * RESULTADO
   * ==========================================================
   */

  return {
    scanned:
      candidates.length,

    created,

    updated,

    cancelled,

    skipped,
  };
}

/*
 * ============================================================
 * CANCELAR RECORDATORIOS INVÁLIDOS
 * ============================================================
 *
 * Revisa todos los recordatorios abiertos:
 *
 * PENDIENTE
 * ERROR
 *
 * y determina si todavía pueden existir.
 */

async function cancelInvalidReminders({
  now,
  eligibleClinicIds,
}) {
  /*
   * Obtener todos los recordatorios abiertos.
   */

  const reminders =
    await findOpenReminders();

  /*
   * Convertimos los IDs de clínica a String
   * para poder compararlos fácilmente con los
   * BigInt provenientes de Prisma.
   */

  const eligibleClinicSet =
    new Set(
      eligibleClinicIds.map(
        (id) =>
          id.toString()
      )
    );

  let cancelled = 0;

  /*
   * ==========================================================
   * REVISAR CADA RECORDATORIO
   * ==========================================================
   */

  for (
    const reminder
    of reminders
  ) {
    const appointment =
      reminder.citas;

    /*
     * ========================================================
     * VALIDAR CONFIGURACIÓN WHATSAPP
     * ========================================================
     *
     * Si la clínica no está dentro de las clínicas
     * elegibles significa que:
     *
     * - no tiene configuración
     * - está inactiva
     * - utiliza META
     *
     * En cualquiera de estos casos no debe existir
     * un recordatorio abierto.
     */

    const whatsappAllowed =
      eligibleClinicSet.has(
        reminder.id_clinica.toString()
      );

    /*
     * ========================================================
     * VALIDAR CITA
     * ========================================================
     */

    const appointmentInvalid =
      !appointment ||
      !ACTIVE_APPOINTMENT_STATES.includes(
        appointment.estado
      ) ||
      new Date(
        appointment.fecha_hora_inicio
      ) <= now;

    /*
     * ========================================================
     * CANCELAR
     * ========================================================
     */

    if (
      !whatsappAllowed ||
      appointmentInvalid
    ) {
      const result =
        await cancelReminder({
          idRecordatorio:
            reminder.id_recordatorio,

          states: [
            "PENDIENTE",
            "ERROR",
          ],
        });

      if (
        result.count ===
        1
      ) {
        cancelled += 1;
      }
    }
  }

  return cancelled;
}

/*
 * ============================================================
 * CANCELAR RECORDATORIO DE UNA CITA
 * ============================================================
 */

export async function cancelAppointmentReminder({
  idClinica,
  idCita,
}) {
  const result =
    await cancelPendingReminder({
      idClinica,

      idCita,
    });

  return {
    cancelled:
      result.count,
  };
}

/*
 * ============================================================
 * LISTAR RECORDATORIOS
 * ============================================================
 */

export async function getClinicReminders({
  idClinica,
  estado,
}) {
  if (
    estado &&
    !REMINDER_STATES.includes(
      estado
    )
  ) {
    throw createReminderStateError(
      `Estado de recordatorio no válido. Estados permitidos: ${REMINDER_STATES.join(", ")}`
    );
  }

  const reminders =
    await findRemindersByClinic({
      idClinica,

      estado,
    });

  return reminders.map(
    formatReminder
  );
}

/*
 * ============================================================
 * RESUMEN
 * ============================================================
 */

export async function getReminderSummary({
  idClinica,
}) {
  const reminders =
    await findRemindersByClinic({
      idClinica,
    });

  return {
    total:
      reminders.length,

    pendientes:
      reminders.filter(
        (reminder) =>
          reminder.estado ===
          "PENDIENTE"
      ).length,

    procesando:
      reminders.filter(
        (reminder) =>
          reminder.estado ===
          "PROCESANDO"
      ).length,

    enviados:
      reminders.filter(
        (reminder) =>
          reminder.estado ===
          "ENVIADO"
      ).length,

    errores:
      reminders.filter(
        (reminder) =>
          reminder.estado ===
          "ERROR"
      ).length,

    cancelados:
      reminders.filter(
        (reminder) =>
          reminder.estado ===
          "CANCELADO"
      ).length,
  };
}