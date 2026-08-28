import { z } from "zod";

export const createClinicSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre es demasiado largo"),

  nit: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(
          /^\d{1,12}-[\dKk]$/,
          "El NIT debe tener un formato válido, por ejemplo 1234567-8"
        ),
    ])
    .optional(),

  direccion: z
    .string()
    .trim()
    .max(500, "La dirección es demasiado larga")
    .optional(),

  telefono: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(
          /^\+?[0-9\s()-]{7,20}$/,
          "El teléfono solo puede contener números, espacios, +, - y paréntesis"
        ),
    ])
    .optional(),

  correo: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .email("El correo electrónico no es válido"),
    ])
    .optional(),
});