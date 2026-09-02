import {
  prisma,
} from "../../../database/prisma.js";

export async function findPatientForMedicalHistory(
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

export async function findMedicalHistory(
  idPaciente
) {
  return prisma.historial_medico.findUnique({
    where: {
      id_paciente: idPaciente,
    },
  });
}

export async function upsertMedicalHistory(
  idPaciente,
  data
) {
  return prisma.historial_medico.upsert({
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