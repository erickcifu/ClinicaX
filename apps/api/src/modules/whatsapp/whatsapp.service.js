/*
 * ============================================================
 * WHATSAPP SERVICE
 * ============================================================
 *
 * Esta capa decide qué proveedor utilizar para enviar
 * mensajes de WhatsApp.
 *
 * El resto de ClinicAX no necesita conocer los detalles
 * del proveedor.
 *
 * Actualmente:
 *
 *   MOCK → desarrollo
 *
 * Más adelante:
 *
 *   META → producción
 */


/*
 * ============================================================
 * PROVIDERS
 * ============================================================
 */

import {
  sendWhatsAppMessage as sendMockWhatsAppMessage,
} from "./providers/mock.provider.js";

import {
  createWhatsAppConfiguration as createWhatsAppConfigurationRecord,
  findWhatsAppConfigurationByClinicId,
  updateWhatsAppConfiguration as updateWhatsAppConfigurationRecord,
} from "./whatsapp.repository.js";


function formatWhatsAppConfiguration(configuration) {
  const {
    access_token,
    ...safeConfiguration
  } = configuration;

  return {
    ...safeConfiguration,
    id_configuracion_whatsapp:
      safeConfiguration.id_configuracion_whatsapp.toString(),
    id_clinica:
      safeConfiguration.id_clinica.toString(),
    has_access_token: Boolean(access_token),
  };
}


export async function getWhatsAppConfiguration(
  idClinica
) {
  const configuration =
    await findWhatsAppConfigurationByClinicId(
      idClinica
    );

  if (!configuration) {
    const error = new Error(
      "La clínica no tiene configuración de WhatsApp registrada"
    );

    error.statusCode = 404;
    error.code = "WHATSAPP_CONFIGURATION_NOT_FOUND";

    throw error;
  }

  return formatWhatsAppConfiguration(configuration);
}


export async function createWhatsAppConfiguration(
  idClinica,
  data
) {
  const existing =
    await findWhatsAppConfigurationByClinicId(
      idClinica
    );

  if (existing) {
    const error = new Error(
      "La clínica ya tiene una configuración de WhatsApp registrada"
    );

    error.statusCode = 409;
    error.code = "WHATSAPP_CONFIGURATION_ALREADY_EXISTS";

    throw error;
  }

  const configuration =
    await createWhatsAppConfigurationRecord(
      idClinica,
      data
    );

  return formatWhatsAppConfiguration(configuration);
}


export async function modifyWhatsAppConfiguration(
  idClinica,
  data
) {
  const existing =
    await findWhatsAppConfigurationByClinicId(
      idClinica
    );

  if (!existing) {
    const error = new Error(
      "La clínica no tiene configuración de WhatsApp registrada"
    );

    error.statusCode = 404;
    error.code = "WHATSAPP_CONFIGURATION_NOT_FOUND";

    throw error;
  }

  const configuration =
    await updateWhatsAppConfigurationRecord(
      idClinica,
      data
    );

  return formatWhatsAppConfiguration(configuration);
}


/*
 * ============================================================
 * CONFIGURACIÓN
 * ============================================================
 */



/*
 * ============================================================
 * MENSAJE DEL RECORDATORIO
 * ============================================================
 */

function buildAppointmentReminderMessage(
  reminder
) {
  const patient =
    reminder.citas?.pacientes;

  const appointment =
    reminder.citas;


  const patientName =
    patient
      ? `${patient.nombres} ${patient.apellidos}`
      : "Paciente";


  const appointmentDate =
    appointment?.fecha_hora_inicio
      ? new Intl.DateTimeFormat(
          "es-GT",
          {
            dateStyle:
              "full",

            timeStyle:
              "short",

            timeZone:
              "America/Guatemala",
          }
        ).format(
          new Date(
            appointment.fecha_hora_inicio
          )
        )
      : "fecha pendiente";


  return [
    `Hola ${patientName}.`,
    "",
    "Te recordamos que tienes una cita odontológica en ClinicAX.",
    "",
    `Fecha y hora: ${appointmentDate}`,
    appointment?.motivo
      ? `Motivo: ${appointment.motivo}`
      : null,
    "",
    "Si necesitas realizar algún cambio en tu cita, por favor comunícate con la clínica.",
  ]
    .filter(Boolean)
    .join("\n");
}


/*
 * ============================================================
 * ENVIAR RECORDATORIO
 * ============================================================
 */

export async function sendAppointmentReminder(
  reminder
) {
  /*
   * ==========================================================
   * REVALIDAR CONFIGURACIÓN DE LA CLÍNICA
   * ==========================================================
   *
   * Esta consulta se realiza justo antes del envío.
   *
   * De esta manera, aunque el recordatorio haya sido
   * planificado anteriormente, la configuración actual
   * de la clínica siempre tiene prioridad.
   */

  const configuration =
    await findWhatsAppConfigurationByClinicId(
      reminder.id_clinica
    );

  /*
   * ----------------------------------------------------------
   * SIN CONFIGURACIÓN
   * ----------------------------------------------------------
   */

  if (!configuration) {
    return {
      status:
        "CANCELLED",

      code:
        "WHATSAPP_CONFIGURATION_NOT_FOUND",

      reason:
        "La clínica no tiene configuración de WhatsApp registrada.",
    };
  }

  /*
   * ----------------------------------------------------------
   * CONFIGURACIÓN INACTIVA
   * ----------------------------------------------------------
   */

  if (
    configuration.activo !==
    true
  ) {
    return {
      status:
        "CANCELLED",

      code:
        "WHATSAPP_CONFIGURATION_INACTIVE",

      reason:
        "La configuración de WhatsApp de la clínica está inactiva.",
    };
  }

  /*
   * ----------------------------------------------------------
   * PROVEEDOR
   * ----------------------------------------------------------
   */

  const provider =
    String(
      configuration.proveedor ||
        ""
    )
      .trim()
      .toUpperCase();

  /*
   * ----------------------------------------------------------
   * META BLOQUEADO POR AHORA
   * ----------------------------------------------------------
   *
   * Aunque una clínica tenga:
   *
   * proveedor = META
   * activo = true
   *
   * todavía NO enviamos.
   *
   * No hay llamadas reales a Meta en esta etapa.
   */

  if (
    provider !==
    "MOCK"
  ) {
    return {
      status:
        "CANCELLED",

      code:
        "WHATSAPP_PROVIDER_BLOCKED",

      reason:
        `El proveedor WhatsApp "${provider || "SIN_PROVEEDOR"}" todavía no está habilitado para envíos.`,
    };
  }

  /*
   * ==========================================================
   * CONSTRUIR MENSAJE
   * ==========================================================
   */

  const message =
    buildAppointmentReminderMessage(
      reminder
    );

  /*
   * ==========================================================
   * MOCK
   * ==========================================================
   *
   * Este es el único proveedor permitido actualmente.
   */

  const result =
    await sendMockWhatsAppMessage({
      reminder,
      message,
    });

  return {
    status:
      "SENT",

    ...result,
  };
}