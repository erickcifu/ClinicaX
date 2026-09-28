import {
  createWhatsAppConfiguration,
  getWhatsAppConfiguration,
  modifyWhatsAppConfiguration,
} from "./whatsapp.service.js";

import {
  createWhatsAppConfigurationSchema,
  updateWhatsAppConfigurationSchema,
} from "./whatsapp.schema.js";

function getAuthenticatedClinicId(req) {
  return BigInt(req.auth.clinicId);
}

export async function getWhatsAppConfigurationController(
  req,
  res,
  next
) {
  try {
    const configuration =
      await getWhatsAppConfiguration(
        getAuthenticatedClinicId(req)
      );

    return res.status(200).json({
      success: true,
      data: configuration,
    });
  } catch (error) {
    next(error);
  }
}

export async function createWhatsAppConfigurationController(
  req,
  res,
  next
) {
  try {
    const data =
      createWhatsAppConfigurationSchema.parse(
        req.body
      );

    const configuration =
      await createWhatsAppConfiguration(
        getAuthenticatedClinicId(req),
        data
      );

    return res.status(201).json({
      success: true,
      message:
        "Configuración de WhatsApp creada correctamente",
      data: configuration,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateWhatsAppConfigurationController(
  req,
  res,
  next
) {
  try {
    const data =
      updateWhatsAppConfigurationSchema.parse(
        req.body
      );

    const configuration =
      await modifyWhatsAppConfiguration(
        getAuthenticatedClinicId(req),
        data
      );

    return res.status(200).json({
      success: true,
      message:
        "Configuración de WhatsApp actualizada correctamente",
      data: configuration,
    });
  } catch (error) {
    next(error);
  }
}
