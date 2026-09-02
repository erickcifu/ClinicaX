import { prisma } from "../../../database/prisma.js";

export async function findClinicSettingsByClinicId(id) {
  const [clinic, settings] = await Promise.all([
    prisma.clinicas.findUnique({
      where: {
        id_clinica: id,
      },

      select: {
        id_clinica: true,
        nombre: true,
        logo_url: true,
        zona_horaria: true,
        estado: true,
      },
    }),

    prisma.configuracion_clinica.findUnique({
      where: {
        id_clinica: id,
      },
    }),
  ]);

  return {
    clinic,
    settings,
  };
}

export async function upsertClinicSettings(id, data) {
  return prisma.configuracion_clinica.upsert({
    where: {
      id_clinica: id,
    },

    update: data,

    create: {
      id_clinica: id,
      ...data,
    },
  });
}