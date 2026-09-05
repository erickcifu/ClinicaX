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
  createConsultationController,
  getConsultationController,
  listConsultationsController,
  updateConsultationController,
} from "./consultations/consultations.controller.js";

import {
  createVitalSignsController,
} from "./consultations/vital-signs/vital-signs.controller.js";

import {
  createOdontogramController,
  createOdontogramDetailController,
  getOdontogramController,
  getTeethCatalogController,
  updateOdontogramDetailController,
} from "./consultations/odontogram/odontogram.controller.js";

import {
  createTreatmentRecordController,
  getTreatmentsCatalogController,
  listTreatmentRecordsController,
  updateTreatmentRecordController,
} from "./consultations/treatments/treatments.controller.js";

import {
  authenticateToken,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../../middlewares/authorization.middleware.js";


const router = Router();


/*
 * =====================================================
 * AUTENTICACIÓN
 * =====================================================
 *
 * Todas las rutas de pacientes requieren JWT válido.
 */
router.use(
  authenticateToken
);


/*
 * =====================================================
 * PACIENTES - LISTADO
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
  listPatientsController
);


/*
 * =====================================================
 * PACIENTES - CREAR
 * =====================================================
 */
router.post(
  "/",
  authorizeRoles(
    "ADMIN",
    "RECEPCION"
  ),
  createPatientController
);


/*
 * =====================================================
 * CATÁLOGO DE DIENTES
 * =====================================================
 *
 * IMPORTANTE:
 *
 * Esta ruta debe ir antes de /:id
 *
 * De lo contrario Express podría interpretar:
 *
 * odontogram
 *
 * como si fuera el id de un paciente.
 */
router.get(
  "/odontogram/teeth",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  getTeethCatalogController
);


/*
 * =====================================================
 * HISTORIA MÉDICA
 * =====================================================
 */
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


/*
 * =====================================================
 * HISTORIA ODONTOLÓGICA
 * =====================================================
 */
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


/*
 * =====================================================
 * CONSULTAS - LISTADO
 * =====================================================
 */
router.get(
  "/:id/consultations",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  listConsultationsController
);


/*
 * =====================================================
 * CONSULTAS - CREAR
 * =====================================================
 */
router.post(
  "/:id/consultations",
  authorizeRoles(
    "ODONTOLOGO"
  ),
  createConsultationController
);


/*
 * =====================================================
 * SIGNOS VITALES
 * =====================================================
 *
 * Una consulta puede tener múltiples tomas.
 */
router.post(
  "/:id/consultations/:consultationId/vital-signs",
  authorizeRoles(
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  createVitalSignsController
);


/*
 * =====================================================
 * ODONTOGRAMA - OBTENER
 * =====================================================
 */
router.get(
  "/:id/consultations/:consultationId/odontogram",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  getOdontogramController
);


/*
 * =====================================================
 * ODONTOGRAMA - CREAR
 * =====================================================
 */
router.post(
  "/:id/consultations/:consultationId/odontogram",
  authorizeRoles(
    "ODONTOLOGO"
  ),
  createOdontogramController
);


/*
 * =====================================================
 * ODONTOGRAMA - AGREGAR DETALLE
 * =====================================================
 *
 * Ejemplo:
 *
 * Diente 46
 * OCLUSAL
 * CARIES
 */
router.post(
  "/:id/consultations/:consultationId/odontogram/details",
  authorizeRoles(
    "ODONTOLOGO"
  ),
  createOdontogramDetailController
);


/*
 * =====================================================
 * ODONTOGRAMA - ACTUALIZAR DETALLE
 * =====================================================
 *
 * Ejemplo:
 *
 * RESINA
 *      ↓
 * CORONA
 *
 * Ruta:
 *
 * PATCH
 * /patients/2/consultations/3/odontogram/details/4
 */
router.patch(
  "/:id/consultations/:consultationId/odontogram/details/:detailId",
  authorizeRoles(
    "ODONTOLOGO"
  ),
  updateOdontogramDetailController
);


/*
 * =====================================================
 * CONSULTA - DETALLE
 * =====================================================
 *
 * La dejamos después de las rutas más específicas.
 */
router.get(
  "/:id/consultations/:consultationId",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  getConsultationController
);


/*
 * =====================================================
 * CONSULTA - ACTUALIZAR / FINALIZAR
 * =====================================================
 */
router.patch(
  "/:id/consultations/:consultationId",
  authorizeRoles(
    "ODONTOLOGO"
  ),
  updateConsultationController
);


/*
 * =====================================================
 * PACIENTE - DETALLE
 * =====================================================
 *
 * IMPORTANTE:
 *
 * Estas rutas genéricas /:id se dejan al final.
 */

router.get(
  "/treatments/catalog",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  getTreatmentsCatalogController
);
router.get(
  "/:id/consultations/:consultationId/treatments",
  authorizeRoles(
    "ADMIN",
    "ODONTOLOGO",
    "ASISTENTE"
  ),
  listTreatmentRecordsController
);


router.post(
  "/:id/consultations/:consultationId/treatments",
  authorizeRoles(
    "ODONTOLOGO"
  ),
  createTreatmentRecordController
);


router.patch(
  "/:id/consultations/:consultationId/treatments/:treatmentRecordId",
  authorizeRoles(
    "ODONTOLOGO"
  ),
  updateTreatmentRecordController
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


/*
 * =====================================================
 * PACIENTE - ACTUALIZAR
 * =====================================================
 */
router.patch(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "RECEPCION"
  ),
  updatePatientController
);


export default router;