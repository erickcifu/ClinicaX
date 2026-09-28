import { prisma } from "../../database/prisma.js";

const REMINDER_INCLUDE = {
  citas: {
    select: {
      id_cita: true,
      id_paciente: true,
      fecha_hora_inicio: true,
      fecha_hora_fin: true,
      estado: true,
      motivo: true,

      pacientes: {
        select: {
          id_paciente: true,
          nombres: true,
          apellidos: true,
          telefono: true,
        },
      },
    },
  },
};

/*
 * ============================================================
 * CONFIGURACIONES DE RECORDATORIOS
 * ============================================================
 *
 * Devuelve:
 *
 * - configuración general de recordatorios
 * - configuración de WhatsApp de la clínica
 *
 * La configuración de WhatsApp será la fuente de verdad
 * para decidir si una clínica puede planificar recordatorios.
 */

export async function findReminderConfigurations() {
  return prisma.configuracion_clinica.findMany({
    select: {
      id_clinica: true,
      horas_recordatorio: true,

      clinicas: {
        select: {
          configuracion_whatsapp: {
            select: {
              proveedor: true,
              activo: true,
            },
          },
        },
      },
    },
  });
}

/*
 * ============================================================
 * BUSCAR CITAS QUE PUEDEN GENERAR RECORDATORIO
 * ============================================================
 */

export async function findReminderCandidates({
  clinicIds,
  from,
  to,
}) {
  if (!clinicIds.length) {
    return [];
  }

  return prisma.citas.findMany({
    where: {
      id_clinica: {
        in: clinicIds,
      },

      fecha_hora_inicio: {
        gt: from,
        lte: to,
      },

      estado: {
        in: [
          "PROGRAMADA",
          "CONFIRMADA",
        ],
      },
    },

    orderBy: {
      fecha_hora_inicio: "asc",
    },

    select: {
      id_cita: true,
      id_clinica: true,
      id_paciente: true,
      fecha_hora_inicio: true,
      fecha_hora_fin: true,
      estado: true,
      motivo: true,

      pacientes: {
        select: {
          id_paciente: true,
          nombres: true,
          apellidos: true,
          telefono: true,
        },
      },
    },
  });
}

/*
 * ============================================================
 * BUSCAR RECORDATORIO DE UNA CITA
 * ============================================================
 */

export async function findReminderByAppointment({
  idClinica,
  idCita,
}) {
  return prisma.recordatorios_cita.findUnique({
    where: {
      id_clinica_id_cita_tipo: {
        id_clinica: idClinica,
        id_cita: idCita,
        tipo: "WHATSAPP",
      },
    },
  });
}

/*
 * ============================================================
 * CREAR RECORDATORIO
 * ============================================================
 */

export async function createPendingReminder({
  idClinica,
  idCita,
  programadoPara,
}) {
  return prisma.recordatorios_cita.create({
    data: {
      id_clinica: idClinica,
      id_cita: idCita,
      tipo: "WHATSAPP",
      programado_para: programadoPara,
      estado: "PENDIENTE",
    },

    include: REMINDER_INCLUDE,
  });
}

/*
 * ============================================================
 * ACTUALIZAR RECORDATORIO PENDIENTE
 * ============================================================
 */

export async function updatePendingReminder({
  idRecordatorio,
  programadoPara,
}) {
  return prisma.recordatorios_cita.update({
    where: {
      id_recordatorio: idRecordatorio,
    },

    data: {
      programado_para: programadoPara,
      estado: "PENDIENTE",
      ultimo_error: null,
      fecha_actualizacion: new Date(),
    },

    include: REMINDER_INCLUDE,
  });
}

/*
 * ============================================================
 * CANCELAR RECORDATORIO DE UNA CITA
 * ============================================================
 *
 * También cancelamos ERROR porque un recordatorio que ya no
 * corresponde a una cita activa tampoco debe volver a intentarse.
 */

export async function cancelPendingReminder({
  idClinica,
  idCita,
}) {
  return prisma.recordatorios_cita.updateMany({
    where: {
      id_clinica: idClinica,
      id_cita: idCita,
      tipo: "WHATSAPP",

      estado: {
        in: [
          "PENDIENTE",
          "ERROR",
        ],
      },
    },

    data: {
      estado: "CANCELADO",
      fecha_actualizacion: new Date(),
    },
  });
}

/*
 * ============================================================
 * RECORDATORIOS ABIERTOS
 * ============================================================
 *
 * Incluye:
 *
 * - PENDIENTE
 * - ERROR
 *
 * Los necesitamos para cancelar automáticamente recordatorios
 * cuando la configuración de WhatsApp deja de ser válida.
 */

export async function findOpenReminders() {
  return prisma.recordatorios_cita.findMany({
    where: {
      tipo: "WHATSAPP",

      estado: {
        in: [
          "PENDIENTE",
          "ERROR",
        ],
      },
    },

    include: REMINDER_INCLUDE,

    orderBy: {
      programado_para: "asc",
    },
  });
}

/*
 * ============================================================
 * CANCELAR RECORDATORIO POR ID
 * ============================================================
 *
 * Se utiliza cuando:
 *
 * - la configuración de WhatsApp desapareció
 * - quedó inactiva
 * - el proveedor está bloqueado
 *
 * También permite cancelar PROCESANDO cuando el worker
 * detecta el cambio justo antes del envío.
 */

export async function cancelReminder({
  idRecordatorio,
  states = [
    "PENDIENTE",
    "ERROR",
    "PROCESANDO",
  ],
}) {
  return prisma.recordatorios_cita.updateMany({
    where: {
      id_recordatorio: idRecordatorio,
      tipo: "WHATSAPP",

      estado: {
        in: states,
      },
    },

    data: {
      estado: "CANCELADO",
      fecha_actualizacion: new Date(),
    },
  });
}

/*
 * ============================================================
 * RECORDATORIOS PENDIENTES
 * ============================================================
 */

export async function findPendingReminders() {
  return prisma.recordatorios_cita.findMany({
    where: {
      estado: "PENDIENTE",
      tipo: "WHATSAPP",
    },

    include: REMINDER_INCLUDE,

    orderBy: {
      programado_para: "asc",
    },
  });
}

/*
 * ============================================================
 * RECORDATORIOS CON ERROR REINTENTABLE
 * ============================================================
 *
 * Busca recordatorios que:
 *
 * 1. Sean de tipo WHATSAPP.
 * 2. Estén en estado ERROR.
 * 3. Todavía no hayan alcanzado el máximo de intentos.
 * 4. Su último intento haya ocurrido antes del momento
 *    permitido para volver a intentar.
 *
 * IMPORTANTE:
 *
 * No modificamos programado_para.
 *
 * Esa fecha representa el momento original en que debía
 * enviarse el recordatorio.
 */

export async function findRetryableReminders({
  maxAttempts,
  retryAfter,
}) {
  return prisma.recordatorios_cita.findMany({
    where: {
      tipo: "WHATSAPP",

      estado: "ERROR",

      intentos: {
        lt: maxAttempts,
      },

      ultimo_intento: {
        lte: retryAfter,
      },
    },

    include: REMINDER_INCLUDE,

    orderBy: {
      ultimo_intento: "asc",
    },
  });
}

/*
 * ============================================================
 * LISTAR RECORDATORIOS DE UNA CLÍNICA
 * ============================================================
 */

export async function findRemindersByClinic({
  idClinica,
  estado,
}) {
  return prisma.recordatorios_cita.findMany({
    where: {
      id_clinica: idClinica,

      ...(estado
        ? {
            estado,
          }
        : {}),
    },

    orderBy: [
      {
        programado_para: "asc",
      },

      {
        id_recordatorio: "asc",
      },
    ],

    include: REMINDER_INCLUDE,
  });
}