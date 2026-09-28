import {
  prisma,
} from "../../database/prisma.js";

export async function findWhatsAppConfigurationByClinicId(
  idClinica
) {
  return prisma.configuracion_whatsapp.findUnique({
    where: {
      id_clinica: idClinica,
    },
  });
}

export async function createWhatsAppConfiguration(
  idClinica,
  data
) {
  return prisma.configuracion_whatsapp.create({
    data: {
      id_clinica: idClinica,
      ...data,
    },
  });
}

export async function updateWhatsAppConfiguration(
  idClinica,
  data
) {
  return prisma.configuracion_whatsapp.update({
    where: {
      id_clinica: idClinica,
    },

    data: {
      ...data,
      fecha_actualizacion: new Date(),
    },
  });
}
