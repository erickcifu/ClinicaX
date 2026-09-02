import {
  getClinicSettings,
  modifyClinicSettings,
} from "./clinic-settings.service.js";

import {
  updateClinicSettingsSchema,
} from "./clinic-settings.schema.js";

export async function getMyClinicSettingsController(
  req,
  res,
  next
) {
  try {
    const idClinica = BigInt(
      req.auth.clinicId
    );

    const settings =
      await getClinicSettings(
        idClinica
      );

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyClinicSettingsController(
  req,
  res,
  next
) {
  try {
    const idClinica = BigInt(
      req.auth.clinicId
    );

    const data =
      updateClinicSettingsSchema.parse(
        req.body
      );

    const settings =
      await modifyClinicSettings(
        idClinica,
        data
      );

    return res.status(200).json({
      success: true,
      message:
        "Configuración actualizada correctamente",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}
