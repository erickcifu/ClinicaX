import { z } from "zod";

export const clinicIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "El ID de la clínica debe ser numérico")
    .transform((value) => BigInt(value)),
});
// crear una nueva clinica
export const createClinicSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre no puede superar 150 caracteres"),

  nit: z
    .string()
    .trim()
    .regex(
      /^\d{1,12}-[\dKk]$/,
      "El NIT debe tener un formato válido, por ejemplo 1234567-8"
    )
    .max(30)
    .nullable()
    .optional(),

  direccion: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional(),

  telefono: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s()-]{8,12}$/,
      "El teléfono solo puede contener números, espacios, +, - y paréntesis"
    )
    .max(30)
    .nullable()
    .optional(),
    

  correo: z
    .string()
    .trim()
    .email("El correo electrónico no es válido")
    .max(150)
    .nullable()
    .optional(),

  logo_url: z
    .string()
    .url("La URL del logo no es válida")
    .optional()
    .nullable(),

  zona_horaria: z
    .string()
    .trim()
    .max(50)
    .default("America/Guatemala"),

  estado: z
    .enum(["ACTIVA", "INACTIVA", "SUSPENDIDA"])
    .default("ACTIVA"),
});
// actualizar cualquier clinica
export const updateClinicSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(150)
      .optional(),

    nit: z
      .string()
      .trim()
      .regex(
        /^\d{1,12}-[\dKk]$/,
        "El NIT debe tener un formato válido, por ejemplo 1234567-8"
      )
      .max(30)
      .nullable()
      .optional(),

    direccion: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional(),

    telefono: z
      .string()
      .trim()
      .regex(
        /^\+?[0-9\s()-]{8,12}$/,
        "El teléfono solo puede contener números, espacios, +, - y paréntesis"
      )
      .max(30)
      .nullable()
      .optional(),
      

    correo: z
      .string()
      .trim()
      .email("El correo electrónico no es válido")
      .max(150)
      .nullable()
      .optional(),

    logo_url: z
      .string()
      .url("La URL del logo no es válida")
      .nullable()
      .optional(),

    zona_horaria: z
      .string()
      .trim()
      .max(50)
      .optional(),

    estado: z
      .enum(["ACTIVA", "INACTIVA", "SUSPENDIDA"])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Debe enviar al menos un campo para actualizar",
    }
  );
  export const updateClinicStatusSchema = z.object({
  estado: z.enum(
    ["ACTIVA", "INACTIVA", "SUSPENDIDA"],
    {
      message: "El estado debe ser ACTIVA, INACTIVA o SUSPENDIDA",
    }
  ),
});