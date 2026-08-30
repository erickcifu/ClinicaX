import { z } from "zod";

export const createUserSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(
      2,
      "Los nombres deben tener al menos 2 caracteres"
    )
    .max(100),

  apellidos: z
    .string()
    .trim()
    .min(
      2,
      "Los apellidos deben tener al menos 2 caracteres"
    )
    .max(100),

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

  telefono: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s()-]{7,20}$/,
      "El teléfono solo puede contener números, espacios, +, - y paréntesis"
    )
    .optional()
    .nullable(),

  contrasena: z
    .string()
    .min(
      10,
      "La contraseña debe tener al menos 10 caracteres"
    )
    .max(128),

  roles: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(40)
        .transform((value) =>
          value.toUpperCase()
        )
    )
    .min(
      1,
      "Debe asignar al menos un rol"
    )
    .max(5)
    .transform(
      (roles) =>
        [...new Set(roles)]
    ),
});
export const listUsersQuerySchema = z.object({
  id_clinica: z
    .string()
    .regex(
      /^\d+$/,
      "El ID de la clínica debe ser numérico"
    )
    .transform((value) => BigInt(value)),
});

export const userIdSchema = z.object({
  id: z
    .string()
    .regex(
      /^\d+$/,
      "El ID del usuario debe ser numérico"
    )
    .transform((value) => BigInt(value)),
});