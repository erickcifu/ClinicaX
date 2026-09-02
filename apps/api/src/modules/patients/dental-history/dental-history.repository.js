import {
  prisma,
} from "../../../database/prisma.js";

export async function findPatientForDentalHistory(
  idClinica,
  idPaciente
) {
  return prisma.pacientes.findFirst({
    where: {
      id_paciente: idPaciente,
      id_clinica: idClinica,
      fecha_eliminacion: null,
    },

    select: {
      id_paciente: true,
      id_clinica: true,
      nombres: true,
      apellidos: true,
    },
  });
}

export async function findDentalHistory(
  idPaciente
) {
  return prisma.historial_odontologico.findUnique({
    where: {
      id_paciente: idPaciente,
    },
  });
}

export async function upsertDentalHistory(
  idPaciente,
  data
) {
  return prisma.historial_odontologico.upsert({
    where: {
      id_paciente: idPaciente,
    },

    create: {
      id_paciente: idPaciente,
      ...data,
    },

    update: {
      ...data,
      fecha_actualizacion:
        new Date(),
    },
  });
}