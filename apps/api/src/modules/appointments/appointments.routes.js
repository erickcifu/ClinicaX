import {
  Router,
} from "express";

import {
  createAppointmentController,
  getAppointmentController,
  listAppointmentDentistsController,
  listAppointmentsController,
  updateAppointmentController,
} from "./appointments.controller.js";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../../middlewares/authorization.middleware.js";


const router =
  Router();


/*
 * =====================================================
 * AUTENTICACIÓN
 * =====================================================
 */
router.use(
  authenticateToken
);


/*
 * =====================================================
 * LISTAR ODONTÓLOGOS
 * =====================================================
 *
 * IMPORTANTE:
 *
 * Va ANTES de /:appointmentId
 *
 * para que Express no interprete:
 *
 * dentists
 *
 * como si fuera un ID.
 */
router.get(
  "/dentists",

  authorizeRoles(
    "ADMIN",
    "RECEPCION",
    "ODONTOLOGO",
    "ASISTENTE"
  ),

  listAppointmentDentistsController
);


/*
 * =====================================================
 * LISTAR AGENDA
 * =====================================================
 */
router.get(
  "/",

  authorizeRoles(
    "ADMIN",
    "RECEPCION",
    "ODONTOLOGO",
    "ASISTENTE"
  ),

  listAppointmentsController
);


/*
 * =====================================================
 * CREAR CITA
 * =====================================================
 *
 * Normalmente:
 *
 * recepción o administración.
 */
router.post(
  "/",

  authorizeRoles(
    "ADMIN",
    "RECEPCION"
  ),

  createAppointmentController
);


/*
 * =====================================================
 * DETALLE DE CITA
 * =====================================================
 */
router.get(
  "/:appointmentId",

  authorizeRoles(
    "ADMIN",
    "RECEPCION",
    "ODONTOLOGO",
    "ASISTENTE"
  ),

  getAppointmentController
);


/*
 * =====================================================
 * ACTUALIZAR CITA
 * =====================================================
 *
 * ADMIN / RECEPCION:
 *
 * - paciente
 * - odontólogo
 * - horario
 * - motivo
 * - notas
 * - estado
 *
 * ODONTOLOGO:
 *
 * el Service solamente le permitirá
 * cambiar SU propia cita a EN_CONSULTA.
 */
router.patch(
  "/:appointmentId",

  authorizeRoles(
    "ADMIN",
    "RECEPCION",
    "ODONTOLOGO"
  ),

  updateAppointmentController
);


export default router;