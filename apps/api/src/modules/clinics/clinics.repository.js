import { prisma } from "../../database/prisma.js";

export async function findAllClinics() {
  return prisma.clinicas.findMany({
    orderBy: {
      id_clinica: "asc",
    },
  });
}

export async function findClinicById(id) {
  return prisma.clinicas.findUnique({
    where: {
      id_clinica: id,
    },
  });
}
// funcion para crear una nueva clinica
export async function createClinic(data) {
  return prisma.clinicas.create({
    data: {
      ...data,

      configuracion_clinica: {
        create: {},
      },
    },
  });
}
// funcion para actualizar una clinica
export async function updateClinic(id, data) {
  return prisma.clinicas.update({
    where: {
      id_clinica: id,
    },
    data,
  });
}
