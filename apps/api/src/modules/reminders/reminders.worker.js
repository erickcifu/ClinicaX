import { prisma } from "../../database/prisma.js";

import {
  findPendingReminders,
  findRetryableReminders,
  cancelReminder,
} from "./reminders.repository.js";

import {
  synchronizeAppointmentReminders,
} from "./reminders.service.js";

import {
  sendAppointmentReminder,
} from "../whatsapp/whatsapp.service.js";

/*
 * ============================================================
 * CONFIGURACIÓN DE REINTENTOS
 * ============================================================
 *
 * Valores por defecto:
 *
 * - Máximo 3 intentos.
 * - Espera de 5 minutos entre intentos.
 *
 * Se pueden modificar temporalmente mediante variables
 * de entorno para realizar pruebas.
 */

const MAX_REMINDER_ATTEMPTS = Number(
  process.env.REMINDER_MAX_ATTEMPTS || 3
);

const REMINDER_RETRY_DELAY_MS = Number(
  process.env.REMINDER_RETRY_DELAY_MS ||
    5 * 60 * 1000
);

/*
 * ============================================================
 * CLAIM ATÓMICO DEL RECORDATORIO
 * ============================================================
 *
 * Cambia:
 *
 * PENDIENTE → PROCESANDO
 *
 * o
 *
 * ERROR → PROCESANDO
 *
 * e incrementa el número de intentos.
 *
 * El estado esperado se incluye en WHERE para evitar
 * que dos procesos intenten enviar el mismo recordatorio.
 */

async function claimReminder({
  idRecordatorio,
  expectedState,
  now,
}) {
  const result =
    await prisma.recordatorios_cita.updateMany({
      where: {
        id_recordatorio:
          idRecordatorio,

        estado:
          expectedState,

        intentos: {
          lt:
            MAX_REMINDER_ATTEMPTS,
        },
      },

      data: {
        estado:
          "PROCESANDO",

        intentos: {
          increment: 1,
        },

        ultimo_intento:
          now,

        fecha_actualizacion:
          now,
      },
    });

  return result.count === 1;
}

/*
 * ============================================================
 * MARCAR RECORDATORIO COMO ENVIADO
 * ============================================================
 */

async function markReminderAsSent({
  idRecordatorio,
  providerMessageId,
  now,
}) {
  await prisma.recordatorios_cita.updateMany({
    where: {
      id_recordatorio:
        idRecordatorio,

      estado:
        "PROCESANDO",
    },

    data: {
      estado:
        "ENVIADO",

      enviado_en:
        now,

      provider_message_id:
        providerMessageId,

      ultimo_error:
        null,

      fecha_actualizacion:
        now,
    },
  });
}

/*
 * ============================================================
 * MARCAR RECORDATORIO COMO ERROR
 * ============================================================
 */

async function markReminderAsError({
  idRecordatorio,
  errorMessage,
  now,
}) {
  await prisma.recordatorios_cita.updateMany({
    where: {
      id_recordatorio:
        idRecordatorio,

      estado:
        "PROCESANDO",
    },

    data: {
      estado:
        "ERROR",

      ultimo_error:
        errorMessage,

      fecha_actualizacion:
        now,
    },
  });
}

/*
 * ============================================================
 * PROCESAR RECORDATORIO
 * ============================================================
 */

async function processReminder({
  reminder,
  expectedState,
}) {
  const now =
    new Date();

  /*
   * Intentamos reclamar el recordatorio.
   *
   * Si devuelve false significa que otro proceso ya
   * lo tomó, o que el estado cambió mientras tanto.
   */

  const claimed =
    await claimReminder({
      idRecordatorio:
        reminder.id_recordatorio,

      expectedState,

      now,
    });

  if (!claimed) {
    console.log(
      `[reminders] recordatorio omitido porque ya fue procesado`,
      {
        idRecordatorio:
          reminder.id_recordatorio.toString(),
      }
    );

    return;
  }

  /*
   * Ya tenemos el recordatorio bajo nuestro control.
   */

  try {
    /*
     * El WhatsApp Service vuelve a consultar la configuración
     * de la clínica justo antes del envío.
     *
     * Puede devolver:
     *
     * SENT
     *     → se envió correctamente.
     *
     * CANCELLED
     *     → la configuración ya no permite enviar.
     *
     * Si es CANCELLED NO lo tratamos como error.
     */

    const result =
      await sendAppointmentReminder(
        reminder
      );

    if (
      result?.status ===
      "CANCELLED"
    ) {
      const cancellation =
        await cancelReminder({
          idRecordatorio:
            reminder.id_recordatorio,

          states: [
            "PROCESANDO",
          ],
        });

      if (
        cancellation.count ===
        1
      ) {
        console.log(
          `[reminders] recordatorio cancelado antes del envío`,
          {
            idRecordatorio:
              reminder.id_recordatorio.toString(),

            code:
              result.code,

            reason:
              result.reason,
          }
        );
      }

      return;
    }

    /*
     * Si llegamos aquí esperamos una respuesta SENT.
     */

    if (
      result?.status !==
      "SENT"
    ) {
      throw new Error(
        "El proveedor WhatsApp devolvió una respuesta inválida."
      );
    }

    const sentAt =
      new Date();

    await markReminderAsSent({
      idRecordatorio:
        reminder.id_recordatorio,

      providerMessageId:
        result.providerMessageId,

      now:
        sentAt,
    });

    console.log(
      `[reminders] recordatorio enviado`,
      {
        idRecordatorio:
          reminder.id_recordatorio.toString(),

        intentos:
          reminder.intentos + 1,

        providerMessageId:
          result.providerMessageId,
      }
    );
  } catch (error) {
    const failedAt =
      new Date();

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    await markReminderAsError({
      idRecordatorio:
        reminder.id_recordatorio,

      errorMessage,

      now:
        failedAt,
    });

    console.error(
      `[reminders] error enviando recordatorio`,
      {
        idRecordatorio:
          reminder.id_recordatorio.toString(),

        intento:
          reminder.intentos + 1,

        maxIntentos:
          MAX_REMINDER_ATTEMPTS,

        error:
          errorMessage,
      }
    );
  }
}

/*
 * ============================================================
 * PROCESAR RECORDATORIOS VENCIDOS
 * ============================================================
 *
 * Incluye:
 *
 * 1. PENDIENTE cuyo programado_para ya llegó.
 *
 * 2. ERROR cuyo tiempo de reintento ya llegó.
 */

export async function processDueReminders() {
  const now =
    new Date();

  /*
   * ----------------------------------------------------------
   * 1. RECORDATORIOS PENDIENTES
   * ----------------------------------------------------------
   */

  const pendingReminders =
    await findPendingReminders();

  const duePendingReminders =
    pendingReminders.filter(
      (reminder) =>
        reminder.programado_para <=
        now
    );

  /*
   * ----------------------------------------------------------
   * 2. RECORDATORIOS CON ERROR REINTENTABLE
   * ----------------------------------------------------------
   *
   * retryAfter representa el momento límite.
   *
   * Ejemplo:
   *
   * ahora = 17:30
   * delay = 5 minutos
   *
   * retryAfter = 17:25
   */

  const retryAfter =
    new Date(
      now.getTime() -
        REMINDER_RETRY_DELAY_MS
    );

  const retryableReminders =
    await findRetryableReminders({
      maxAttempts:
        MAX_REMINDER_ATTEMPTS,

      retryAfter,
    });

  /*
   * ----------------------------------------------------------
   * PROCESAR PENDIENTES
   * ----------------------------------------------------------
   */

  for (
    const reminder
    of duePendingReminders
  ) {
    await processReminder({
      reminder,

      expectedState:
        "PENDIENTE",
    });
  }

  /*
   * ----------------------------------------------------------
   * PROCESAR REINTENTOS
   * ----------------------------------------------------------
   */

  for (
    const reminder
    of retryableReminders
  ) {
    await processReminder({
      reminder,

      expectedState:
        "ERROR",
    });
  }

  /*
   * ----------------------------------------------------------
   * LOG DEL CICLO
   * ----------------------------------------------------------
   */

  if (
    duePendingReminders.length >
      0 ||
    retryableReminders.length >
      0
  ) {
    console.log(
      `[reminders] procesamiento ejecutado`,
      {
        pendientes:
          duePendingReminders.length,

        reintentos:
          retryableReminders.length,
      }
    );
  }
}

/*
 * ============================================================
 * CICLO COMPLETO DEL PLANIFICADOR
 * ============================================================
 *
 * 1. Sincroniza las citas con sus recordatorios.
 *
 * 2. Procesa los recordatorios que corresponda enviar.
 */

export async function runReminderPlanner() {
  try {
    const planningResult =
      await synchronizeAppointmentReminders();

    console.log(
      `[reminders] planificación ejecutada`,
      planningResult
    );

    await processDueReminders();
  } catch (error) {
    console.error(
      `[reminders] error en el ciclo del planificador`,
      error
    );
  }
}

/*
 * ============================================================
 * INICIAR PLANIFICADOR
 * ============================================================
 */

export function startReminderPlanner({
  intervalMs = 60 * 1000,
} = {}) {
  console.log(
    `[reminders] planificador iniciado. Intervalo: ${intervalMs} ms`
  );

  /*
   * Ejecutamos inmediatamente el primer ciclo.
   */

  runReminderPlanner();

  /*
   * Después continuamos ejecutando el ciclo
   * según el intervalo configurado.
   */

  const interval =
    setInterval(
      runReminderPlanner,
      intervalMs
    );

  return interval;
}

/*
 * ============================================================
 * DETENER PLANIFICADOR
 * ============================================================
 */

export function stopReminderPlanner(
  interval
) {
  if (interval) {
    clearInterval(interval);
  }
}