import {
  getAppointment,
  getAppointmentDentists,
  getAppointments,
  modifyAppointment,
  registerAppointment,
} from "./appointments.service.js";

import {
  appointmentParamsSchema,
  appointmentQuerySchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from "./appointments.schema.js";


/*
 * =====================================================
 * GET AGENDA
 * =====================================================
 */
export async function listAppointmentsController(
  req,
  res,
  next
) {
  try {
    const filters =
      appointmentQuerySchema.parse(
        req.query
      );


    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    const appointments =
      await getAppointments(
        idClinica,
        filters
      );


    return res
      .status(200)
      .json({
        success: true,

        data: {
          appointments,
        },
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * GET ODONTÓLOGOS
 * =====================================================
 */
export async function listAppointmentDentistsController(
  req,
  res,
  next
) {
  try {
    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    const dentists =
      await getAppointmentDentists(
        idClinica
      );


    return res
      .status(200)
      .json({
        success: true,

        data: {
          dentists,
        },
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * GET DETALLE
 * =====================================================
 */
export async function getAppointmentController(
  req,
  res,
  next
) {
  try {
    const {
      appointmentId,
    } =
      appointmentParamsSchema.parse(
        req.params
      );


    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    const appointment =
      await getAppointment(
        idClinica,
        appointmentId
      );


    return res
      .status(200)
      .json({
        success: true,

        data:
          appointment,
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * POST CREAR CITA
 * =====================================================
 */
export async function createAppointmentController(
  req,
  res,
  next
) {
  try {
    const data =
      createAppointmentSchema.parse(
        req.body
      );


    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    const idUsuario =
      BigInt(
        req.auth.userId
      );


    const appointment =
      await registerAppointment(
        idClinica,
        idUsuario,
        data
      );


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Cita creada correctamente",

        data:
          appointment,
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * PATCH CITA
 * =====================================================
 */
export async function updateAppointmentController(
  req,
  res,
  next
) {
  try {
    const {
      appointmentId,
    } =
      appointmentParamsSchema.parse(
        req.params
      );


    const data =
      updateAppointmentSchema.parse(
        req.body
      );


    const idClinica =
      BigInt(
        req.auth.clinicId
      );


    const idUsuario =
      BigInt(
        req.auth.userId
      );


    /*
     * authenticateToken ya dejó roles
     * dentro de req.auth.
     */
    const roles =
      Array.isArray(
        req.auth.roles
      )
        ? req.auth.roles
        : [];


    const appointment =
      await modifyAppointment(
        idClinica,
        appointmentId,
        idUsuario,
        roles,
        data
      );


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Cita actualizada correctamente",

        data:
          appointment,
      });

  } catch (error) {
    next(error);
  }
}