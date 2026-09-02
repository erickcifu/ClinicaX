import {
  getPatientDentalHistory,
  savePatientDentalHistory,
} from "./dental-history.service.js";

import {
  updateDentalHistorySchema,
} from "./dental-history.schema.js";

import {
  patientIdSchema,
} from "../patients.schema.js";

export async function getDentalHistoryController(
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
      await getPatientDentalHistory(
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

export async function updateDentalHistoryController(
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
      updateDentalHistorySchema.parse(
        req.body
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const history =
      await savePatientDentalHistory(
        idClinica,
        id,
        data
      );

    return res.status(200).json({
      success: true,

      message:
        "Historia odontológica actualizada correctamente",

      data: history,
    });
  } catch (error) {
    next(error);
  }
}