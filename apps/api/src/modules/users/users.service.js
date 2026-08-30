import argon2 from "argon2";

import {
  createUserWithRoles,
  findActiveRolesByCodes,
  findClinicForUser,
  findUserByEmail,
  findUsersByClinic,
  findUserById,
} from "./users.repository.js";

function formatUser(user) {
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
    ultimo_acceso: user.ultimo_acceso,
    fecha_creacion: user.fecha_creacion,
    fecha_actualizacion:
      user.fecha_actualizacion,

    roles: user.usuario_roles.map(
      (userRole) => ({
        id_rol: userRole.roles.id_rol,
        codigo: userRole.roles.codigo,
        nombre: userRole.roles.nombre,
      })
    ),
  };
}

export async function registerUser(
  data,
  idClinica
) {
  const clinic =
    await findClinicForUser(
      idClinica
    );

  if (!clinic) {
    const error = new Error(
      "La clínica solicitada no existe"
    );

    error.statusCode = 404;
    error.code = "CLINIC_NOT_FOUND";

    throw error;
  }

  if (clinic.estado !== "ACTIVA") {
    const error = new Error(
      "No se pueden registrar usuarios en una clínica que no está activa"
    );

    error.statusCode = 409;
    error.code = "CLINIC_NOT_ACTIVE";

    throw error;
  }

  const existingUser =
    await findUserByEmail(
      idClinica,
      data.correo
    );

  if (existingUser) {
    const error = new Error(
      "Ya existe un usuario con este correo en la clínica"
    );

    error.statusCode = 409;
    error.code = "USER_EMAIL_EXISTS";

    throw error;
  }

  const roles =
    await findActiveRolesByCodes(
      data.roles
    );

  const foundRoleCodes =
    new Set(
      roles.map(
        (role) => role.codigo
      )
    );

  const missingRoles =
    data.roles.filter(
      (code) =>
        !foundRoleCodes.has(code)
    );

  if (missingRoles.length > 0) {
    const error = new Error(
      `Los siguientes roles no existen o están inactivos: ${missingRoles.join(", ")}`
    );

    error.statusCode = 400;
    error.code = "INVALID_ROLES";

    throw error;
  }

  const passwordHash =
    await argon2.hash(
      data.contrasena,
      {
        type: argon2.argon2id,
      }
    );

  const user =
    await createUserWithRoles({
      idClinica,
      nombres: data.nombres,
      apellidos: data.apellidos,
      correo: data.correo,
      telefono: data.telefono,
      passwordHash,

      roleIds:
        roles.map(
          (role) => role.id_rol
        ),
    });

  return formatUser(user);
}
export async function getUsersByClinic(idClinica) {
  const clinic =
    await findClinicForUser(idClinica);

  if (!clinic) {
    const error = new Error(
      "La clínica solicitada no existe"
    );

    error.statusCode = 404;
    error.code = "CLINIC_NOT_FOUND";

    throw error;
  }

  const users =
    await findUsersByClinic(idClinica);

  return users.map(formatUser);
}

export async function getUserById(
  idClinica,
  idUsuario
) {
  const user =
    await findUserById(
      idClinica,
      idUsuario
    );

  if (!user) {
    const error = new Error(
      "El usuario solicitado no existe"
    );

    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";

    throw error;
  }

  return formatUser(user);
}