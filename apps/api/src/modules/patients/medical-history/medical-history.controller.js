import {
  getPatientMedicalHistory,
  savePatientMedicalHistory,
} from "./medical-history.service.js";

import {
  updateMedicalHistorySchema,
} from "./medical-history.schema.js";

import {
  patientIdSchema,
} from "../patients.schema.js";

export async function getMedicalHistoryController(
  req,
  res,
  next
) {
  try {
    const { id } =
      patientIdSchema.parse(
        req.params
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const result =
      await getPatientMedicalHistory(
        idClinica,
        id
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMedicalHistoryController(
  req,
  res,
  next
) {
  try {
    const { id } =
      patientIdSchema.parse(
        req.params
      );

    const data =
      updateMedicalHistorySchema.parse(
        req.body
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const history =
      await savePatientMedicalHistory(
        idClinica,
        id,
        data
      );

    return res.status(200).json({
      success: true,

      message:
        "Historia médica actualizada correctamente",

      data: history,
    });
  } catch (error) {
    next(error);
  }
}