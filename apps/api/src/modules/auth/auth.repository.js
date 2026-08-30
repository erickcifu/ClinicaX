import { prisma } from "../../database/prisma.js";

export async function findUserForLogin(
  idClinica,
  correo
) {
  return prisma.usuarios.findFirst({
    where: {
      id_clinica: idClinica,
      fecha_eliminacion: null,

      correo: {
        equals: correo,
        mode: "insensitive",
      },
    },

    include: {
      clinicas: {
        select: {
          id_clinica: true,
          nombre: true,
          estado: true,
        },
      },

      usuario_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
}

export async function updateUserLastAccess(
  idUsuario
) {
  return prisma.usuarios.update({
    where: {
      id_usuario: idUsuario,
    },

    data: {
      ultimo_acceso: new Date(),
    },
  });
}