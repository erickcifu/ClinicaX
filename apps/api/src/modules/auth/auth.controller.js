import {
  login,
} from "./auth.service.js";

import {
  loginSchema,
} from "./auth.schema.js";

export async function loginController(
  req,
  res,
  next
) {
  try {
    const data =
      loginSchema.parse(
        req.body
      );

    const session =
      await login(data);

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Inicio de sesión correcto",
        data: session,
      });
  } catch (error) {
    next(error);
  }
}

export async function meController(
  req,
  res,
  next
) {
  try {
    return res.status(200).json({
      success: true,

      data: {
        id_usuario:
          req.auth.userId,

        id_clinica:
          req.auth.clinicId,

        nombres:
          req.auth.nombres,

        apellidos:
          req.auth.apellidos,

        correo:
          req.auth.correo,

        clinica:
          req.auth.clinic,

        roles:
          req.auth.roles,
      },
    });
  } catch (error) {
    next(error);
  }
}