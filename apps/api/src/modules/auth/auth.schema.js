import { z } from "zod";

export const loginSchema = z.object({
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