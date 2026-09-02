import { z } from "zod";

export const createPatientSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(3, "Los nombres deben tener al menos 2 caracteres")
    .max(100),

  apellidos: z
    .string()
    .trim()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(100),

  dpi: z
    .string()
    .trim()
    .max(25)
    .optional()
    .nullable(),

  fecha_nacimiento: z
    .string()
    .date("La fecha de nacimiento no es válida")
    .optional()
    .nullable(),

  sexo: z
  .enum(
    [
      "FEMENINO",
      "MASCULINO",
    ],
    {
      message:
        "El sexo debe ser FEMENINO o MASCULINO",
    }
  )
  .optional()
  .nullable(),

  telefono: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s()-]{7,20}$/,
      "El teléfono no tiene un formato válido"
    )
    .optional()
    .nullable(),

  correo: z
    .string()
    .trim()
    .email("El correo electrónico no es válido")
    .max(150)
    .optional()
    .nullable(),

  direccion: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable(),

  ocupacion: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable(),

  contacto_emergencia: z
    .string()
    .trim()
    .max(150)
    .optional()
    .nullable(),

  telefono_emergencia: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s()-]{7,20}$/,
      "El teléfono de emergencia no tiene un formato válido"
    )
    .optional()
    .nullable(),

  observaciones: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable(),
});
export const patientIdSchema = z.object({
  id: z
    .string()
    .regex(
      /^\d+$/,
      "El ID del paciente debe ser numérico"
    )
    .transform((value) => BigInt(value)),
});

export const updatePatientSchema =
  createPatientSchema
    .partial()
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "Debe enviar al menos un campo para actualizar",
      }
    );