import { z } from "zod";


/*
 * =====================================================
 * CREAR REGISTRO DE TRATAMIENTO
 * =====================================================
 */
export const createTreatmentRecordSchema =
  z.object({
    id_tratamiento: z.coerce
      .bigint()
      .positive(),

    id_diente: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),

    id_plan_detalle: z.coerce
      .bigint()
      .positive()
      .optional()
      .nullable(),

    descripcion: z
      .string()
      .trim()
      .max(3000)
      .optional()
      .nullable(),

    valor: z.coerce
      .number()
      .min(
        0,
        "El valor no puede ser negativo"
      )
      .default(0),

    observaciones: z
      .string()
      .trim()
      .max(3000)
      .optional()
      .nullable(),
  });


/*
 * =====================================================
 * ACTUALIZAR REGISTRO
 * =====================================================
 *
 * No permitimos cambiar:
 *
 * - consulta
 * - clínica
 * - realizado por
 *
 * porque provienen del contexto autenticado.
 */
export const updateTreatmentRecordSchema =
  z
    .object({
      id_tratamiento: z.coerce
        .bigint()
        .positive()
        .optional(),

      id_diente: z
        .union([
          z.coerce
            .number()
            .int()
            .positive(),

          z.null(),
        ])
        .optional(),

      descripcion: z
        .string()
        .trim()
        .max(3000)
        .nullable()
        .optional(),

      valor: z.coerce
        .number()
        .min(0)
        .optional(),

      observaciones: z
        .string()
        .trim()
        .max(3000)
        .nullable()
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


/*
 * =====================================================
 * ID DEL REGISTRO
 * =====================================================
 */
export const treatmentRecordParamsSchema =
  z.object({
    treatmentRecordId: z.coerce
      .bigint()
      .positive(),
  });