import {
  getUserById,
  getUsersByClinic,
  registerUser,
} from "./users.service.js";

import {
  createUserSchema,
  userIdSchema,
} from "./users.schema.js";

export async function createUserController(
  req,
  res,
  next
) {
  try {
    const data =
      createUserSchema.parse(
        req.body
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const user =
      await registerUser(
        data,
        idClinica
      );

    res.location(
      `/api/v1/users/${user.id_usuario}`
    );

    return res.status(201).json({
      success: true,
      message:
        "Usuario registrado correctamente",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function listUsersController(
  req,
  res,
  next
) {
  try {
    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const users =
      await getUsersByClinic(
        idClinica
      );

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserController(
  req,
  res,
  next
) {
  try {
    const { id } =
      userIdSchema.parse(
        req.params
      );

    const idClinica =
      BigInt(
        req.auth.clinicId
      );

    const user =
      await getUserById(
        idClinica,
        id
      );

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}