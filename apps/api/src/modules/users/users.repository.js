import { prisma } from "../../database/prisma.js";

export async function findClinicForUser(idClinica) {
  return prisma.clinicas.findUnique({
    where: {
      id_clinica: idClinica,
    },

    select: {
      id_clinica: true,
      nombre: true,
      estado: true,
    },
  });
}

export async function findUserByEmail(
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
  });
}

export async function findActiveRolesByCodes(
  codes
) {
  return prisma.roles.findMany({
    where: {
      codigo: {
        in: codes,
      },

      activo: true,
    },

    orderBy: {
      id_rol: "asc",
    },
  });
}

export async function createUserWithRoles({
  idClinica,
  nombres,
  apellidos,
  correo,
  telefono,
  passwordHash,
  roleIds,
}) {
  return prisma.$transaction(
    async (tx) => {
      const user =
        await tx.usuarios.create({
          data: {
            id_clinica: idClinica,
            nombres,
            apellidos,
            correo,
            telefono: telefono || null,
            contrasena_hash: passwordHash,
            estado: "ACTIVO",
          },
        });

      await tx.usuario_roles.createMany({
        data: roleIds.map((idRol) => ({
          id_usuario: user.id_usuario,
          id_rol: idRol,
        })),
      });

      return tx.usuarios.findUnique({
        where: {
          id_usuario: user.id_usuario,
        },

        include: {
          usuario_roles: {
            include: {
              roles: true,
            },
          },
        },
      });
    }
  );
}
export async function findUsersByClinic(idClinica) {
  return prisma.usuarios.findMany({
    where: {
      id_clinica: idClinica,
      fecha_eliminacion: null,
    },

    include: {
      usuario_roles: {
        include: {
          roles: true,
        },
      },
    },

    orderBy: [
      {
        nombres: "asc",
      },
      {
        apellidos: "asc",
      },
    ],
  });
}

export async function findUserById(
  idClinica,
  idUsuario
) {
  return prisma.usuarios.findFirst({
    where: {
      id_usuario: idUsuario,
      id_clinica: idClinica,
      fecha_eliminacion: null,
    },

    include: {
      usuario_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
}