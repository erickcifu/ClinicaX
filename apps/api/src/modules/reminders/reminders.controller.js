import {
  getClinicReminders,
  getReminderSummary,
  synchronizeAppointmentReminders,
} from "./reminders.service.js";


/*
 * =====================================================
 * LISTAR RECORDATORIOS
 * =====================================================
 */

export async function listRemindersController(
  req,
  res,
  next
) {

  try {

    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    const estado =
      req.query.estado ||
      undefined;


    const reminders =
      await getClinicReminders({
        idClinica,
        estado,
      });


    return res
      .status(200)
      .json({
        success: true,

        data: {
          reminders,
        },
      });

  } catch (error) {

    next(error);

  }
}


/*
 * =====================================================
 * RESUMEN
 * =====================================================
 */

export async function getReminderSummaryController(
  req,
  res,
  next
) {

  try {

    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    const summary =
      await getReminderSummary({
        idClinica,
      });


    return res
      .status(200)
      .json({
        success: true,

        data: summary,
      });

  } catch (error) {

    next(error);

  }
}


/*
 * =====================================================
 * SINCRONIZAR
 * =====================================================
 *
 * IMPORTANTE:
 *
 * Esto solamente planifica recordatorios.
 * No envía WhatsApp.
 */

export async function synchronizeRemindersController(
  req,
  res,
  next
) {

  try {

    const result =
      await synchronizeAppointmentReminders();


    return res
      .status(200)
      .json({
        success: true,

        data: result,
      });

  } catch (error) {

    next(error);

  }
}