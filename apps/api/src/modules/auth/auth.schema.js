import { z } from "zod";

export const loginSchema = z.object({
  id_clinica: z
    .union([
      z
        .string()
        .regex(
          /^\d+$/,
          "El ID de la clínica debe ser numérico"
        ),

      z
        .number()
        .int()
        .positive(),
    ])
    .transform((value) =>
      BigInt(value)
    ),

  correo: z
    .string()
    .trim()
    .email(
      "El correo electrónico no es válido"
    )
    .max(150)
    .transform((value) =>
      value.toLowerCase()
    ),

  contrasena: z
    .string()
    .min(
      1,
      "La contraseña es obligatoria"
    )
    .max(128),
});