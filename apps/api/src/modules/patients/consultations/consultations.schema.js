import { z } from "zod";


/*
 * Parámetros para obtener una consulta.
 */
export const consultationParamsSchema =
  z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "El ID del paciente debe ser numérico"
      )
      .transform(
        (value) => BigInt(value)
      ),

    consultationId: z
      .string()
      .regex(
        /^\d+$/,
        "El ID de la consulta debe ser numérico"
      )
      .transform(
        (value) => BigInt(value)
      ),
  });


/*
 * Crear consulta.
 */
export const createConsultationSchema =
  z.object({
    motivo_consulta: z
      .string()
      .trim()
      .min(
        2,
        "El motivo de consulta debe tener al menos 2 caracteres"
      )
      .max(
        2000,
        "El motivo de consulta es demasiado largo"
      ),

    observaciones: z
      .string()
      .trim()
      .max(
        3000,
        "Las observaciones son demasiado largas"
      )
      .optional()
      .nullable(),
  });


/*
 * Actualizar consulta.
 */
export const updateConsultationSchema =
  z
    .object({
      diagnostico: z
        .string()
        .trim()
        .max(
          3000,
          "El diagnóstico es demasiado largo"
        )
        .optional()
        .nullable(),

      observaciones: z
        .string()
        .trim()
        .max(
          3000,
          "Las observaciones son demasiado largas"
        )
        .optional()
        .nullable(),

      estado: z
        .enum([
          "ABIERTA",
          "FINALIZADA",
        ])
        .optional(),
    })
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "Debe enviar al menos un campo para actualizar",
      }
    );