import {
  getClinicSettings,
  modifyClinicSettings,
} from "./clinic-settings.service.js";

import {
  clinicIdSchema,
} from "../clinics.schema.js";

import {
  updateClinicSettingsSchema,
} from "./clinic-settings.schema.js";

export async function getClinicSettingsController(
  req,
  res,
  next
) {
  try {
    const { id } = clinicIdSchema.parse(
      req.params
    );

    const settings =
      await getClinicSettings(id);

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateClinicSettingsController(
  req,
  res,
  next
) {
  try {
    const { id } = clinicIdSchema.parse(
      req.params
    );

    const data =
      updateClinicSettingsSchema.parse(
        req.body
      );

    const settings =
      await modifyClinicSettings(
        id,
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