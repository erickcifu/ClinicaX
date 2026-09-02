import { prisma } from "../../database/prisma.js";

export async function findPatientsByClinic(idClinica) {
  return prisma.pacientes.findMany({
    where: {
      id_clinica: idClinica,
      fecha_eliminacion: null,
    },

    orderBy: [
      {
        apellidos: "asc",
      },
      {
        nombres: "asc",
      },
    ],
  });
}
export async function findPatientByDpi(
  idClinica,
  dpi
) {
  if (!dpi) {
    return null;
  }

  return prisma.pacientes.findFirst({
    where: {
      id_clinica: idClinica,
      dpi,
      fecha_eliminacion: null,
    },
  });
}

export async function findLastPatientByClinic(
  idClinica
) {
  return prisma.pacientes.findFirst({
    where: {
      id_clinica: idClinica,
    },

    orderBy: {
      id_paciente: "desc",
    },

    select: {
      id_paciente: true,
    },
  });
}

export async function createPatient(
  data
) {
  return prisma.pacientes.create({
    data,
  });
}
export async function findPatientById(
  idClinica,
  idPaciente
) {
  return prisma.pacientes.findFirst({
    where: {
      id_paciente: idPaciente,
      id_clinica: idClinica,
      fecha_eliminacion: null,
    },
  });
}

export async function updatePatient(
  idClinica,
  idPaciente,
  data
) {
  const result =
    await prisma.pacientes.updateMany({
      where: {
        id_paciente: idPaciente,
        id_clinica: idClinica,
        fecha_eliminacion: null,
      },

      data,
    });

  if (result.count === 0) {
    return null;
  }

  return findPatientById(
    idClinica,
    idPaciente
  );
}