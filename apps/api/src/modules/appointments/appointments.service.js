import {
  createAppointment,
  findActiveDentists,
  findAppointmentById,
  findAppointments,
  findClinicAppointmentConfiguration,
  findDentistAppointmentOverlap,
  findDentistForAppointment,
  findPatientAppointmentOverlap,
  findPatientForAppointment,
  updateAppointment,
} from "./appointments.repository.js";

/*
 * =====================================================
 * TRANSICIONES DE ESTADO PERMITIDAS
 * =====================================================
 *
 * Flujo de vida de una cita.
 *
 * PROGRAMADA
 *    ↓
 * CONFIRMADA
 *    ↓
 * EN_ESPERA
 *    ↓
 * EN_CONSULTA
 *    ↓
 * FINALIZADA
 *
 * También permitimos cancelar o marcar como no asistió
 * antes de finalizar la consulta.
 */
const APPOINTMENT_STATE_TRANSITIONS = {
  PROGRAMADA: [
    "CONFIRMADA",
    "EN_ESPERA",
    "EN_CONSULTA",
    "CANCELADA",
    "NO_ASISTIO",
  ],

  CONFIRMADA: [
    "EN_ESPERA",
    "EN_CONSULTA",
    "CANCELADA",
    "NO_ASISTIO",
  ],

  EN_ESPERA: [
    "EN_CONSULTA",
    "CANCELADA",
    "NO_ASISTIO",
  ],

  EN_CONSULTA: [
    "FINALIZADA",
  ],

  FINALIZADA: [],

  CANCELADA: [],

  NO_ASISTIO: [],
};


/*
 * =====================================================
 * ERRORES
 * =====================================================
 */

function createAppointmentNotFoundError() {
  const error = new Error(
    "La cita solicitada no existe"
  );

  error.statusCode = 404;
  error.code = "APPOINTMENT_NOT_FOUND";

  return error;
}


function createPatientNotFoundError() {
  const error = new Error(
    "El paciente seleccionado no existe o no pertenece a esta clínica"
  );

  error.statusCode = 404;
  error.code = "PATIENT_NOT_FOUND";

  return error;
}


function createDentistNotFoundError() {
  const error = new Error(
    "El odontólogo seleccionado no existe, está inactivo o no tiene el rol ODONTOLOGO"
  );

  error.statusCode = 404;
  error.code = "DENTIST_NOT_FOUND";

  return error;
}


function createInvalidAppointmentRangeError() {
  const error = new Error(
    "La fecha de finalización debe ser posterior a la fecha de inicio"
  );

  error.statusCode = 400;
  error.code = "INVALID_APPOINTMENT_RANGE";

  return error;
}


function createDentistOverlapError(appointment) {
  const error = new Error(
    "El odontólogo ya tiene una cita que se cruza con este horario"
  );

  error.statusCode = 409;
  error.code = "DENTIST_APPOINTMENT_OVERLAP";

  error.details = {
    appointmentId: appointment.id_cita.toString(),

    fecha_hora_inicio:
      appointment.fecha_hora_inicio,

    fecha_hora_fin:
      appointment.fecha_hora_fin,

    paciente: appointment.pacientes
      ? `${appointment.pacientes.nombres} ${appointment.pacientes.apellidos}`
      : null,
  };

  return error;
}


function createPatientOverlapError(appointment) {
  const error = new Error(
    "El paciente ya tiene una cita que se cruza con este horario"
  );

  error.statusCode = 409;
  error.code = "PATIENT_APPOINTMENT_OVERLAP";

  error.details = {
    appointmentId: appointment.id_cita.toString(),

    fecha_hora_inicio:
      appointment.fecha_hora_inicio,

    fecha_hora_fin:
      appointment.fecha_hora_fin,
  };

  return error;
}


function createAppointmentLinkedToConsultationError() {
  const error = new Error(
    "La cita ya tiene una consulta asociada y no puede cambiar de paciente, odontólogo ni horario"
  );

  error.statusCode = 409;
  error.code = "APPOINTMENT_HAS_CONSULTATION";

  return error;
}


function createDentistAppointmentPermissionError() {
  const error = new Error(
    "El odontólogo solamente puede actualizar el estado de sus propias citas"
  );

  error.statusCode = 403;
  error.code = "APPOINTMENT_UPDATE_FORBIDDEN";

  return error;
}


/*
 * =====================================================
 * ERROR DE TRANSICIÓN DE ESTADO
 * =====================================================
 */

function createInvalidAppointmentStateTransitionError(
  currentState,
  newState
) {
  const error = new Error(
    `No se puede cambiar una cita de ${currentState} a ${newState}`
  );

  error.statusCode = 409;
  error.code = "INVALID_APPOINTMENT_STATE_TRANSITION";

  error.details = {
    currentState,
    newState,
  };

  return error;
}


/*
 * =====================================================
 * VALIDAR TRANSICIÓN DE ESTADO
 * =====================================================
 */

function validateAppointmentStateTransition(
  currentState,
  newState
) {
  /*
   * Si se envía el mismo estado nuevamente,
   * no consideramos que sea un error.
   */
  if (currentState === newState) {
    return;
  }

  const allowedStates =
    APPOINTMENT_STATE_TRANSITIONS[currentState] || [];

  if (!allowedStates.includes(newState)) {
    throw createInvalidAppointmentStateTransitionError(
      currentState,
      newState
    );
  }
}


/*
 * =====================================================
 * NORMALIZAR ROLES
 * =====================================================
 */

function normalizeRoles(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map((role) => {
      if (typeof role === "string") {
        return role;
      }

      return (
        role?.codigo ||
        role?.code ||
        null
      );
    })
    .filter(Boolean);
}


/*
 * =====================================================
 * FORMATEAR USUARIO
 * =====================================================
 */

function formatUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,

    id_usuario:
      user.id_usuario.toString(),
  };
}


/*
 * =====================================================
 * FORMATEAR PACIENTE
 * =====================================================
 */

function formatPatient(patient) {
  if (!patient) {
    return null;
  }

  return {
    ...patient,

    id_paciente:
      patient.id_paciente.toString(),
  };
}


/*
 * =====================================================
 * FORMATEAR CITA
 * =====================================================
 */

function formatAppointment(appointment) {
  if (!appointment) {
    return null;
  }

  const dentist =
    appointment
      .usuarios_citas_id_clinica_id_odontologoTousuarios;

  const createdBy =
    appointment
      .usuarios_citas_id_clinica_id_creado_porTousuarios;

  const consultation =
    appointment.consultas
      ? {
          ...appointment.consultas,

          id_consulta:
            appointment
              .consultas
              .id_consulta
              .toString(),
        }
      : null;

  return {
    ...appointment,

    id_cita:
      appointment
        .id_cita
        .toString(),

    id_clinica:
      appointment
        .id_clinica
        .toString(),

    id_paciente:
      appointment
        .id_paciente
        .toString(),

    id_odontologo:
      appointment
        .id_odontologo
        .toString(),

    id_creado_por:
      appointment.id_creado_por
        ? appointment
            .id_creado_por
            .toString()
        : null,

    paciente:
      formatPatient(
        appointment.pacientes
      ),

    odontologo:
      formatUser(
        dentist
      ),

    creado_por:
      formatUser(
        createdBy
      ),

    consulta:
      consultation,

    pacientes:
      undefined,

    usuarios_citas_id_clinica_id_odontologoTousuarios:
      undefined,

    usuarios_citas_id_clinica_id_creado_porTousuarios:
      undefined,

    consultas:
      undefined,
  };
}


/*
 * =====================================================
 * LISTAR AGENDA
 * =====================================================
 */

export async function getAppointments(
  idClinica,
  filters
) {
  const appointments =
    await findAppointments({
      idClinica,

      from:
        filters.from,

      to:
        filters.to,

      dentistId:
        filters.dentistId,

      patientId:
        filters.patientId,

      status:
        filters.status,
    });

  return appointments.map(
    formatAppointment
  );
}


/*
 * =====================================================
 * LISTAR ODONTÓLOGOS
 * =====================================================
 */

export async function getAppointmentDentists(
  idClinica
) {
  const dentists =
    await findActiveDentists(
      idClinica
    );

  return dentists.map(
    (dentist) => ({
      ...dentist,

      id_usuario:
        dentist
          .id_usuario
          .toString(),
    })
  );
}


/*
 * =====================================================
 * DETALLE DE CITA
 * =====================================================
 */

export async function getAppointment(
  idClinica,
  idCita
) {
  const appointment =
    await findAppointmentById(
      idClinica,
      idCita
    );

  if (!appointment) {
    throw createAppointmentNotFoundError();
  }

  return formatAppointment(
    appointment
  );
}


/*
 * =====================================================
 * VALIDAR DISPONIBILIDAD
 * =====================================================
 */

async function validateAvailability({
  idClinica,
  idPaciente,
  idOdontologo,
  fechaInicio,
  fechaFin,
  excludeAppointmentId = null,
}) {
  if (fechaFin <= fechaInicio) {
    throw createInvalidAppointmentRangeError();
  }

  /*
   * Validamos primero la agenda
   * del odontólogo.
   */
  const dentistOverlap =
    await findDentistAppointmentOverlap({
      idClinica,
      idOdontologo,
      fechaInicio,
      fechaFin,
      excludeAppointmentId,
    });

  if (dentistOverlap) {
    throw createDentistOverlapError(
      dentistOverlap
    );
  }

  /*
   * Después validamos que el paciente
   * tampoco tenga otra cita simultánea.
   */
  const patientOverlap =
    await findPatientAppointmentOverlap({
      idClinica,
      idPaciente,
      fechaInicio,
      fechaFin,
      excludeAppointmentId,
    });

  if (patientOverlap) {
    throw createPatientOverlapError(
      patientOverlap
    );
  }
}


/*
 * =====================================================
 * CREAR CITA
 * =====================================================
 */

export async function registerAppointment(
  idClinica,
  idUsuario,
  data
) {
  /*
   * Validar paciente.
   */
  const patient =
    await findPatientForAppointment(
      idClinica,
      data.id_paciente
    );

  if (!patient) {
    throw createPatientNotFoundError();
  }

  /*
   * Validar odontólogo.
   */
  const dentist =
    await findDentistForAppointment(
      idClinica,
      data.id_odontologo
    );

  if (!dentist) {
    throw createDentistNotFoundError();
  }

  /*
   * Si frontend no manda fecha fin,
   * usamos la duración configurada
   * para la clínica.
   */
  let fechaFin =
    data.fecha_hora_fin;

  if (!fechaFin) {
    const configuration =
      await findClinicAppointmentConfiguration(
        idClinica
      );

    const minutes =
      configuration
        ?.duracion_cita_minutos ||
      30;

    fechaFin =
      new Date(
        data
          .fecha_hora_inicio
          .getTime() +
        minutes *
          60 *
          1000
      );
  }

  /*
   * Validar que el horario esté disponible.
   */
  await validateAvailability({
    idClinica,

    idPaciente:
      data.id_paciente,

    idOdontologo:
      data.id_odontologo,

    fechaInicio:
      data.fecha_hora_inicio,

    fechaFin,
  });

  /*
   * Crear cita.
   */
  const appointment =
    await createAppointment({
      idClinica,

      idPaciente:
        data.id_paciente,

      idOdontologo:
        data.id_odontologo,

      idCreadoPor:
        idUsuario,

      fechaInicio:
        data.fecha_hora_inicio,

      fechaFin,

      motivo:
        data.motivo,

      estado:
        data.estado,

      notas:
        data.notas,
    });

  return formatAppointment(
    appointment
  );
}


/*
 * =====================================================
 * ACTUALIZAR / REPROGRAMAR CITA
 * =====================================================
 */

export async function modifyAppointment(
  idClinica,
  idCita,
  actorUserId,
  actorRoles,
  data
) {
  /*
   * Buscar cita dentro de la clínica.
   */
  const existing =
    await findAppointmentById(
      idClinica,
      idCita
    );

  if (!existing) {
    throw createAppointmentNotFoundError();
  }


  /*
   * ===================================================
   * VALIDAR TRANSICIÓN DE ESTADO
   * ===================================================
   *
   * La transición se valida antes de comprobar
   * los permisos específicos del usuario.
   */
  if (data.estado !== undefined) {
    validateAppointmentStateTransition(
      existing.estado,
      data.estado
    );
  }


  /*
   * ===================================================
   * NORMALIZAR ROLES
   * ===================================================
   */

  const normalizedRoles =
    normalizeRoles(
      actorRoles
    );


  /*
   * ===================================================
   * PERMISOS DE ADMINISTRACIÓN
   * ===================================================
   *
   * ADMIN, RECEPCION y SUPERADMIN
   * pueden administrar Agenda.
   */

  const canManageAppointments =
    normalizedRoles.includes(
      "ADMIN"
    ) ||
    normalizedRoles.includes(
      "RECEPCION"
    ) ||
    normalizedRoles.includes(
      "SUPERADMIN"
    );


  /*
   * ===================================================
   * REGLAS PARA ODONTÓLOGO
   * ===================================================
   *
   * El odontólogo:
   *
   * 1. Solamente puede modificar sus propias citas.
   *
   * 2. Solamente puede modificar el campo estado.
   *
   * 3. El nuevo estado debe respetar
   *    APPOINTMENT_STATE_TRANSITIONS.
   *
   * Ejemplos permitidos:
   *
   * EN_ESPERA → EN_CONSULTA
   * CONFIRMADA → EN_CONSULTA
   * EN_CONSULTA → FINALIZADA
   */
  if (!canManageAppointments) {

    /*
     * Convertimos el ID del actor a BigInt
     * para compararlo correctamente con Prisma.
     *
     * Esto evita comparar:
     *
     * 1n !== "1"
     *
     * que sería true.
     */
    let normalizedActorUserId;

    try {
      normalizedActorUserId =
        BigInt(actorUserId);
    } catch {
      throw createDentistAppointmentPermissionError();
    }


    /*
     * El odontólogo solamente puede
     * modificar sus propias citas.
     */
    if (
      existing.id_odontologo !==
      normalizedActorUserId
    ) {
      throw createDentistAppointmentPermissionError();
    }


    /*
     * Un odontólogo no puede cambiar
     * paciente, odontólogo ni horario.
     *
     * Solamente puede cambiar estado.
     */
    const fields =
      Object.keys(data);

    if (
      fields.length !== 1 ||
      fields[0] !== "estado"
    ) {
      throw createDentistAppointmentPermissionError();
    }
  }


  /*
   * ===================================================
   * CITA CON CONSULTA ASOCIADA
   * ===================================================
   *
   * Una vez que exista una consulta,
   * protegemos:
   *
   * - paciente
   * - odontólogo
   * - fecha inicio
   * - fecha fin
   */

  const changesStructuralData =
    data.id_paciente !== undefined ||
    data.id_odontologo !== undefined ||
    data.fecha_hora_inicio !== undefined ||
    data.fecha_hora_fin !== undefined;


  if (
    existing.consultas &&
    changesStructuralData
  ) {
    throw createAppointmentLinkedToConsultationError();
  }


  /*
   * ===================================================
   * PACIENTE FINAL
   * ===================================================
   */

  const idPaciente =
    data.id_paciente ??
    existing.id_paciente;


  /*
   * ===================================================
   * ODONTÓLOGO FINAL
   * ===================================================
   */

  const idOdontologo =
    data.id_odontologo ??
    existing.id_odontologo;


  /*
   * Si cambió paciente,
   * volvemos a validarlo.
   */

  if (
    data.id_paciente !== undefined
  ) {
    const patient =
      await findPatientForAppointment(
        idClinica,
        idPaciente
      );

    if (!patient) {
      throw createPatientNotFoundError();
    }
  }


  /*
   * Si cambió odontólogo,
   * volvemos a comprobar que:
   *
   * - pertenece a la clínica
   * - está activo
   * - tiene rol ODONTOLOGO
   */

  if (
    data.id_odontologo !== undefined
  ) {
    const dentist =
      await findDentistForAppointment(
        idClinica,
        idOdontologo
      );

    if (!dentist) {
      throw createDentistNotFoundError();
    }
  }


  /*
   * ===================================================
   * CALCULAR HORARIO FINAL
   * ===================================================
   *
   * Si solamente cambia fecha_hora_inicio,
   * conservamos la duración anterior.
   */

  const previousDuration =
    existing.fecha_hora_fin.getTime() -
    existing.fecha_hora_inicio.getTime();


  const fechaInicio =
    data.fecha_hora_inicio ??
    existing.fecha_hora_inicio;


  let fechaFin;


  if (
    data.fecha_hora_fin !== undefined
  ) {

    /*
     * El usuario envió explícitamente
     * una nueva fecha final.
     */
    fechaFin =
      data.fecha_hora_fin;

  } else if (
    data.fecha_hora_inicio !== undefined
  ) {

    /*
     * Solo cambió el inicio:
     * conservamos la duración.
     */
    fechaFin =
      new Date(
        fechaInicio.getTime() +
        previousDuration
      );

  } else {

    /*
     * No cambió el horario.
     */
    fechaFin =
      existing.fecha_hora_fin;
  }


  /*
   * ===================================================
   * VALIDAR DISPONIBILIDAD AL REPROGRAMAR
   * ===================================================
   */

  if (changesStructuralData) {
    await validateAvailability({
      idClinica,

      idPaciente,

      idOdontologo,

      fechaInicio,

      fechaFin,

      /*
       * Excluimos la propia cita,
       * para que no choque consigo misma.
       */
      excludeAppointmentId:
        idCita,
    });
  }


  /*
   * ===================================================
   * ACTUALIZAR
   * ===================================================
   */

  const updated =
    await updateAppointment(
      idCita,
      {
        ...(data.id_paciente !== undefined && {
          id_paciente:
            idPaciente,
        }),

        ...(data.id_odontologo !== undefined && {
          id_odontologo:
            idOdontologo,
        }),

        ...(data.fecha_hora_inicio !== undefined && {
          fecha_hora_inicio:
            fechaInicio,
        }),

        ...(
          data.fecha_hora_inicio !== undefined ||
          data.fecha_hora_fin !== undefined
            ? {
                fecha_hora_fin:
                  fechaFin,
              }
            : {}
        ),

        ...(data.motivo !== undefined && {
          motivo:
            data.motivo,
        }),

        ...(data.notas !== undefined && {
          notas:
            data.notas,
        }),

        ...(data.estado !== undefined && {
          estado:
            data.estado,
        }),
      }
    );


  return formatAppointment(
    updated
  );
}