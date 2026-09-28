import {
  Router,
} from "express";


import {
  getReminderSummaryController,
  listRemindersController,
  synchronizeRemindersController,
} from "./reminders.controller.js";


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
 * RESUMEN
 * =====================================================
 */

router.get(
  "/summary",

  authorizeRoles(
    "ADMIN",
    "RECEPCION",
    "ODONTOLOGO",
    "ASISTENTE"
  ),

  getReminderSummaryController
);


/*
 * =====================================================
 * LISTAR
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

  listRemindersController
);


/*
 * =====================================================
 * SINCRONIZAR
 * =====================================================
 *
 * Solamente ADMIN/SUPERADMIN.
 *
 * Esto permite probar manualmente el
 * planificador mientras desarrollamos.
 */

router.post(
  "/synchronize",

  authorizeRoles(
    "ADMIN",
    "SUPERADMIN"
  ),

  synchronizeRemindersController
);


export default router;