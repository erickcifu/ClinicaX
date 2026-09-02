import argon2 from "argon2";
import jwt from "jsonwebtoken";

import {
  findUsersForLogin,
  updateUserLastAccess,
} from "./auth.repository.js";

import {
  SUPERADMIN_ROLE_CODE,
} from "../roles/roles.constants.js";

function createInvalidCredentialsError() {
  const error = new Error(
    "Correo o contraseña incorrectos"
  );

  error.statusCode = 401;
  error.code = "INVALID_CREDENTIALS";

  return error;
}

function createAmbiguousLoginError() {
  const error = new Error(
    "Estas credenciales están asociadas a más de una clínica. Contacte al administrador"
  );

  error.statusCode = 409;
  error.code =
    "AMBIGUOUS_LOGIN_CLINIC";

  return error;
}

function getActiveUserRoles(user) {
  return user.usuario_roles.filter(
    (userRole) =>
      userRole.roles.activo
  );
}

function hasActiveRole(
  user,
  roleCode
) {
  return getActiveUserRoles(
    user
  ).some(
    (userRole) =>
      userRole.roles.codigo ===
      roleCode
  );
}

function formatAuthUser(user) {
  return {
    id_usuario:
      user.id_usuario.toString(),

    id_clinica:
      user.id_clinica.toString(),

    nombres: user.nombres,
    apellidos: user.apellidos,
    correo: user.correo,
    telefono: user.telefono,
    estado: user.estado,

    clinica: {
      id_clinica:
        user.clinicas.id_clinica.toString(),

      nombre:
        user.clinicas.nombre,
    },

    roles:
      getActiveUserRoles(user).map(
        (userRole) => ({
          id_rol:
            userRole.roles.id_rol,

          codigo:
            userRole.roles.codigo,

          nombre:
            userRole.roles.nombre,
        })
      ),
  };
}

export async function login(data) {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET no está configurado"
    );
  }

  const candidates =
    await findUsersForLogin(
      data.correo
    );

  if (candidates.length === 0) {
    throw createInvalidCredentialsError();
  }

  const passwordMatches = (
    await Promise.all(
      candidates.map(async (candidate) => {
        if (!candidate.contrasena_hash) {
          return null;
        }

        const passwordIsValid =
          await argon2.verify(
            candidate.contrasena_hash,
            data.contrasena
          );

        return passwordIsValid
          ? candidate
          : null;
      })
    )
  ).filter(Boolean);

  if (passwordMatches.length === 0) {
    throw createInvalidCredentialsError();
  }

  const activeMatches =
    passwordMatches.filter(
      (candidate) =>
        candidate.estado ===
          "ACTIVO" &&
        (
          candidate.clinicas.estado ===
            "ACTIVA" ||
          hasActiveRole(
            candidate,
            SUPERADMIN_ROLE_CODE
          )
        )
    );

  if (activeMatches.length > 1) {
    throw createAmbiguousLoginError();
  }

  const user =
    activeMatches[0] ||
    passwordMatches[0];

  if (
    user.clinicas.estado !==
      "ACTIVA" &&
    !hasActiveRole(
      user,
      SUPERADMIN_ROLE_CODE
    )
  ) {
    const error = new Error(
      "La clínica no está activa"
    );

    error.statusCode = 403;
    error.code =
      "CLINIC_NOT_ACTIVE";

    throw error;
  }

  if (
    user.estado !== "ACTIVO"
  ) {
    const error = new Error(
      "El usuario no está activo"
    );

    error.statusCode = 403;
    error.code =
      "USER_NOT_ACTIVE";

    throw error;
  }

  const roleCodes =
    getActiveUserRoles(user).map(
      (userRole) =>
        userRole.roles.codigo
    );

  const token = jwt.sign(
    {
      clinicId:
        user.id_clinica.toString(),

      roles: roleCodes,
    },

    process.env.JWT_SECRET,

    {
      subject:
        user.id_usuario.toString(),

      expiresIn:
        process.env
          .JWT_EXPIRES_IN ||
        "8h",

      issuer: "clinicax-api",
      audience: "clinicax-web",
    }
  );

  await updateUserLastAccess(
    user.id_usuario
  );

  return {
    token,
    token_type: "Bearer",

    expires_in:
      process.env.JWT_EXPIRES_IN ||
      "8h",

    user: formatAuthUser(user),
  };
}
