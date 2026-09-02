import { Router } from "express";

import {
  createPatientController,
  getPatientController,
  listPatientsController,
  updatePatientController,
} from "./patients.controller.js";

import {
  getMedicalHistoryController,
  updateMedicalHistoryController,
} from "./medical-history/medical-history.controller.js";

import {
  getDentalHistoryController,
  updateDentalHistoryController,
} from "./dental-history/dental-history.controller.js";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(
  authenticateToken
);

router.get(
  "/",
  authorizeRoles(
    "ADMIN",
    "RECEPCION",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  listPatientsController
);

router.post(
  "/",
  authorizeRoles(
    "ADMIN",
    "RECEPCION"
  ),
  createPatientController
);

router.get(
  "/:id/medical-history",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  getMedicalHistoryController
);

router.patch(
  "/:id/medical-history",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO"
  ),
  updateMedicalHistoryController
);

router.get(
  "/:id/dental-history",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  getDentalHistoryController
);

router.patch(
  "/:id/dental-history",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO"
  ),
  updateDentalHistoryController
);

router.get(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "RECEPCION",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  getPatientController
);

router.patch(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "RECEPCION"
  ),
  updatePatientController
);

export default router;