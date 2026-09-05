import {
  getConsultationTreatmentRecords,
  getTreatmentsCatalog,
  modifyConsultationTreatment,
  registerConsultationTreatment,
} from "./treatments.service.js";

import {
  consultationParamsSchema,
} from "../consultations.schema.js";

import {
  createTreatmentRecordSchema,
  treatmentRecordParamsSchema,
  updateTreatmentRecordSchema,
} from "./treatments.schema.js";


/*
 * =====================================================
 * CATÁLOGO
 * =====================================================
 */
export async function getTreatmentsCatalogController(
  req,
  res,
  next
) {
  try {
    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const treatments =
      await getTreatmentsCatalog(
        idClinica
      );

    return res
      .status(200)
      .json({
        success: true,

        data: {
          treatments,
        },
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * GET REGISTROS DE LA CONSULTA
 * =====================================================
 */
export async function listTreatmentRecordsController(
  req,
  res,
  next
) {
  try {
    const {
      id,
      consultationId,
    } =
      consultationParamsSchema.parse(
        req.params
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const records =
      await getConsultationTreatmentRecords(
        idClinica,
        id,
        consultationId
      );

    return res
      .status(200)
      .json({
        success: true,
        data: records,
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * POST REGISTRO
 * =====================================================
 */
export async function createTreatmentRecordController(
  req,
  res,
  next
) {
  try {
    const {
      id,
      consultationId,
    } =
      consultationParamsSchema.parse(
        req.params
      );

    const data =
      createTreatmentRecordSchema.parse(
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

    const record =
      await registerConsultationTreatment(
        idClinica,
        id,
        consultationId,
        idUsuario,
        data
      );

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Tratamiento registrado correctamente",

        data:
          record,
      });

  } catch (error) {
    next(error);
  }
}


/*
 * =====================================================
 * PATCH REGISTRO
 * =====================================================
 */
export async function updateTreatmentRecordController(
  req,
  res,
  next
) {
  try {
    const {
      id,
      consultationId,
    } =
      consultationParamsSchema.parse(
        req.params
      );

    const {
      treatmentRecordId,
    } =
      treatmentRecordParamsSchema.parse(
        req.params
      );

    const data =
      updateTreatmentRecordSchema.parse(
        req.body
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const record =
      await modifyConsultationTreatment(
        idClinica,
        id,
        consultationId,
        treatmentRecordId,
        data
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Registro de tratamiento actualizado correctamente",

        data:
          record,
      });

  } catch (error) {
    next(error);
  }
}