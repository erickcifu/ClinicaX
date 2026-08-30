import {
  findClinicSettingsByClinicId,
  upsertClinicSettings,
} from "./clinic-settings.repository.js";

function formatClinic(clinic) {
  return {
    ...clinic,
    id_clinica: clinic.id_clinica.toString(),
  };
}

function formatSettings(settings) {
  return {
    ...settings,
    id_clinica: settings.id_clinica.toString(),
  };
}

export async function getClinicSettings(id) {
  const {
    clinic,
    settings,
  } = await findClinicSettingsByClinicId(id);

  if (!clinic) {
    const error = new Error(
      "La clínica solicitada no existe"
    );

    error.statusCode = 404;
    error.code = "CLINIC_NOT_FOUND";

    throw error;
  }

  if (!settings) {
    const error = new Error(
      "La clínica no tiene configuración registrada"
    );

    error.statusCode = 404;
    error.code = "CLINIC_SETTINGS_NOT_FOUND";

    throw error;
  }

  return {
    clinic: formatClinic(clinic),
    settings: formatSettings(settings),
  };
}

export async function modifyClinicSettings(
  id,
  data
) {
  const {
    clinic,
  } = await findClinicSettingsByClinicId(id);

  if (!clinic) {
    const error = new Error(
      "La clínica solicitada no existe"
    );

    error.statusCode = 404;
    error.code = "CLINIC_NOT_FOUND";

    throw error;
  }

  const settings =
    await upsertClinicSettings(id, data);

  return formatSettings(settings);
}