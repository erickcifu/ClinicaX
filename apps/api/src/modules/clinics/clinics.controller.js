import {
  getAllClinics,
  getClinicById,
  registerClinic,
  modifyClinic,
  changeClinicStatus,
} from "./clinics.service.js";

import {
  clinicIdSchema,
  createClinicSchema,
  updateClinicSchema,
  updateClinicStatusSchema,
} from "./clinics.schema.js";

export async function listClinicsController(req, res, next) {
  try {
    const clinics = await getAllClinics();

    return res.status(200).json({
      success: true,
      data: clinics,
    });
  } catch (error) {
    next(error);
  }
}

export async function getClinicController(req, res, next) {
  try {
    const { id } = clinicIdSchema.parse(req.params);

    const clinic = await getClinicById(id);

    return res.status(200).json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    next(error);
  }
}

export async function createClinicController(req, res, next) {
  try {
    const data = createClinicSchema.parse(req.body);

    const clinic = await registerClinic(data);

    res.location(`/api/v1/clinics/${clinic.id_clinica}`);

    return res.status(201).json({
      success: true,
      message: "Clínica registrada correctamente",
      data: clinic,
    });
  } catch (error) {
    next(error);
  }
}
export async function updateClinicController(req, res, next) {
  try {
    const { id } = clinicIdSchema.parse(req.params);

    const data = updateClinicSchema.parse(req.body);

    const clinic = await modifyClinic(id, data);

    return res.status(200).json({
      success: true,
      message: "Clínica actualizada correctamente",
      data: clinic,
    });
  } catch (error) {
    next(error);
  }
}
export async function updateClinicStatusController(req, res, next) {
  try {
    const { id } = clinicIdSchema.parse(req.params);

    const { estado } = updateClinicStatusSchema.parse(req.body);

    const clinic = await changeClinicStatus(id, estado);

    return res.status(200).json({
      success: true,
      message: "Estado de la clínica actualizado correctamente",
      data: clinic,
    });
  } catch (error) {
    next(error);
  }
}