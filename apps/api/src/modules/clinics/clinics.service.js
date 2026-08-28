import {
  findAllClinics,
  findClinicById,
  createClinic,
  updateClinic,
} from "./clinics.repository.js";

function formatClinic(clinic) {
  return {
    ...clinic,
    id_clinica: clinic.id_clinica.toString(),
  };
}

export async function getAllClinics() {
  const clinics = await findAllClinics();

  return clinics.map(formatClinic);
}

export async function getClinicById(id) {
  const clinic = await findClinicById(id);

  if (!clinic) {
    const error = new Error("La clínica solicitada no existe");

    error.statusCode = 404;
    error.code = "CLINIC_NOT_FOUND";

    throw error;
  }

  return formatClinic(clinic);
}
export async function registerClinic(data) {
  const clinic = await createClinic(data);

  return formatClinic(clinic);
}
export async function modifyClinic(id, data) {
  const existingClinic = await findClinicById(id);

  if (!existingClinic) {
    const error = new Error("La clínica solicitada no existe");

    error.statusCode = 404;
    error.code = "CLINIC_NOT_FOUND";

    throw error;
  }

  const clinic = await updateClinic(id, data);

  return formatClinic(clinic);
}
// delete para status para no perder datos
export async function changeClinicStatus(id, estado) {
  const existingClinic = await findClinicById(id);

  if (!existingClinic) {
    const error = new Error("La clínica solicitada no existe");

    error.statusCode = 404;
    error.code = "CLINIC_NOT_FOUND";

    throw error;
  }

  const clinic = await updateClinic(id, {
    estado,
  });

  return formatClinic(clinic);
}