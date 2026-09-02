import {
  getPatientById,
  getPatientsByClinic,
  modifyPatient,
  registerPatient,
} from "./patients.service.js";

import {
  createPatientSchema,
  patientIdSchema,
  updatePatientSchema,
} from "./patients.schema.js";

export async function listPatientsController(
  req,
  res,
  next
) {
  try {
    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const patients =
      await getPatientsByClinic(
        idClinica
      );

    return res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
}
export async function createPatientController(
  req,
  res,
  next
) {
  try {
    const data =
      createPatientSchema.parse(
        req.body
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const patient =
      await registerPatient(
        idClinica,
        data
      );

    res.location(
      `/api/v1/patients/${patient.id_paciente}`
    );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Paciente registrado correctamente",
        data: patient,
      });
  } catch (error) {
    next(error);
  }
}
export async function getPatientController(
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

    const patient =
      await getPatientById(
        idClinica,
        id
      );

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
}
export async function updatePatientController(
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
      updatePatientSchema.parse(
        req.body
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const patient =
      await modifyPatient(
        idClinica,
        id,
        data
      );

    return res.status(200).json({
      success: true,
      message:
        "Paciente actualizado correctamente",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
}