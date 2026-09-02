import jwt from "jsonwebtoken";

import { prisma } from "../database/prisma.js";

import {
  SUPERADMIN_ROLE_CODE,
} from "../modules/roles/roles.constants.js";

export async function authenticateToken(
  req,
  res,
  next
) {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      const error = new Error(
        "Se requiere autenticación"
      );

      error.statusCode = 401;
      error.code =
        "AUTH_TOKEN_REQUIRED";

      throw error;
    }

    const [scheme, token] =
      authorization.split(" ");

    if (
      scheme !== "Bearer" ||
      !token
    ) {
      const error = new Error(
        "El encabezado de autenticación no es válido"
      );

      error.statusCode = 401;
      error.code =
        "INVALID_AUTH_HEADER";

      throw error;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET no está configurado"
      );
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: "clinicax-api",
        audience: "clinicax-web",
      }
    );

    if (
      !payload.sub ||
      !payload.clinicId
    ) {
      const error = new Error(
        "El token no contiene la información requerida"
      );

      error.statusCode = 401;
      error.code =
        "INVALID_TOKEN_PAYLOAD";

      throw error;
    }

    const user =
      await prisma.usuarios.findFirst({
        where: {
          id_usuario: BigInt(
            payload.sub
          ),

          id_clinica: BigInt(
            payload.clinicId
          ),

          fecha_eliminacion: null,
        },

        select: {
          id_usuario: true,
          id_clinica: true,
          nombres: true,
          apellidos: true,
          correo: true,
          estado: true,

          clinicas: {
            select: {
              id_clinica: true,
              nombre: true,
              estado: true,
            },
          },

          usuario_roles: {
            select: {
              roles: {
                select: {
                  id_rol: true,
                  codigo: true,
                  nombre: true,
                  activo: true,
                },
              },
            },
          },
        },
      });

    if (!user) {
      const error = new Error(
        "El usuario autenticado ya no existe"
      );

      error.statusCode = 401;
      error.code =
        "AUTH_USER_NOT_FOUND";

      throw error;
    };
    const activeRoles =
      user.usuario_roles
        .filter(
          (userRole) =>
            userRole.roles.activo
        )
        .map(
          (userRole) => ({
            id_rol:
              userRole.roles.id_rol,

            codigo:
              userRole.roles.codigo,

            nombre:
              userRole.roles.nombre,
          })
        );

    const isSuperadmin =
      activeRoles.some(
        (role) =>
          role.codigo ===
          SUPERADMIN_ROLE_CODE
      );

    if (user.estado !== "ACTIVO") {
      const error = new Error(
        "El usuario no está activo"
      );

      error.statusCode = 403;
      error.code =
        "USER_NOT_ACTIVE";

      throw error;
    }

    if (
      user.clinicas.estado !==
        "ACTIVA" &&
      !isSuperadmin
    ) {
      const error = new Error(
        "La clínica no está activa"
      );

      error.statusCode = 403;
      error.code =
        "CLINIC_NOT_ACTIVE";

      throw error;
    };
    req.auth = {
      userId:
        user.id_usuario.toString(),

      clinicId:
        user.id_clinica.toString(),

      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo,

      clinic: {
        id_clinica:
          user.clinicas
            .id_clinica
            .toString(),

        nombre:
          user.clinicas.nombre,
      },

      roles: activeRoles,
    };

    next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      error.statusCode = 401;
      error.code =
        "TOKEN_EXPIRED";
      error.message =
        "La sesión ha expirado";
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      error.statusCode = 401;
      error.code =
        "INVALID_TOKEN";
      error.message =
        "El token de autenticación no es válido";
    }

    next(error);
  }
}
