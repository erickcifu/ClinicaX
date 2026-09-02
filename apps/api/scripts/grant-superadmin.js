import { prisma } from "../src/database/prisma.js";

import {
  SUPERADMIN_ROLE_CODE,
} from "../src/modules/roles/roles.constants.js";

const email = process.argv[2]
  ?.trim()
  .toLowerCase();

if (!email) {
  console.error(
    "Uso: npm run superadmin:grant -- correo@ejemplo.com"
  );

  process.exitCode = 1;
} else {
  try {
    const result =
      await prisma.$transaction(
        async (tx) => {
          const users =
            await tx.usuarios.findMany({
              where: {
                fecha_eliminacion: null,
                correo: {
                  equals: email,
                  mode: "insensitive",
                },
              },

              select: {
                id_usuario: true,
                id_clinica: true,
                estado: true,
              },
            });

          if (users.length === 0) {
            throw new Error(
              "No existe una cuenta activa o registrada con ese correo"
            );
          }

          if (users.length > 1) {
            throw new Error(
              "El correo pertenece a más de una clínica; el aprovisionamiento requiere una cuenta de plataforma única"
            );
          }

          const user = users[0];

          if (user.estado !== "ACTIVO") {
            throw new Error(
              "La cuenta seleccionada no está activa"
            );
          }

          const role =
            await tx.roles.upsert({
              where: {
                codigo:
                  SUPERADMIN_ROLE_CODE,
              },

              update: {
                nombre:
                  "Superadministrador",
                descripcion:
                  "Administración global de la plataforma ClinicAX",
                activo: true,
              },

              create: {
                codigo:
                  SUPERADMIN_ROLE_CODE,
                nombre:
                  "Superadministrador",
                descripcion:
                  "Administración global de la plataforma ClinicAX",
                activo: true,
              },
            });

          const existingAssignment =
            await tx.usuario_roles.findFirst({
              where: {
                id_usuario:
                  user.id_usuario,
                id_rol: role.id_rol,
              },
            });

          if (!existingAssignment) {
            await tx.usuario_roles.create({
              data: {
                id_usuario:
                  user.id_usuario,
                id_rol: role.id_rol,
              },
            });
          }

          return {
            idUsuario:
              user.id_usuario.toString(),
            idClinica:
              user.id_clinica.toString(),
            alreadyAssigned:
              Boolean(existingAssignment),
          };
        }
      );

    console.log(
      result.alreadyAssigned
        ? `La cuenta ${email} ya tenía SUPERADMIN.`
        : `SUPERADMIN asignado a ${email}.`
    );

    console.log(
      `Usuario ${result.idUsuario}, clínica de referencia ${result.idClinica}.`
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
