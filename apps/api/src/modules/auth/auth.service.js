import argon2 from "argon2";
import jwt from "jsonwebtoken";

import {
  findUserForLogin,
  updateUserLastAccess,
} from "./auth.repository.js";

function createInvalidCredentialsError() {
  const error = new Error(
    "Correo, contraseña o clínica incorrectos"
  );

  error.statusCode = 401;
  error.code = "INVALID_CREDENTIALS";

  return error;
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
      user.usuario_roles.map(
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

  const user =
    await findUserForLogin(
      data.id_clinica,
      data.correo
    );

  if (
    !user ||
    !user.contrasena_hash
  ) {
    throw createInvalidCredentialsError();
  }

  const passwordIsValid =
    await argon2.verify(
      user.contrasena_hash,
      data.contrasena
    );

  if (!passwordIsValid) {
    throw createInvalidCredentialsError();
  }

  if (
    user.clinicas.estado !==
    "ACTIVA"
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
    user.usuario_roles.map(
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