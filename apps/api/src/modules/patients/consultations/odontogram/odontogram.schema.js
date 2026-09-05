import { z } from "zod";


/*
 * =====================================================
 * CREAR ODONTOGRAMA
 * =====================================================
 *
 * Coincide con el CHECK:
 *
 * ck_odontogramas_tipo
 */
export const createOdontogramSchema =
  z.object({
    tipo: z
      .enum([
        "INICIAL",
        "EVOLUCION",
      ])
      .default("EVOLUCION"),

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
 * =====================================================
 * SUPERFICIES PERMITIDAS
 * =====================================================
 *
 * Coinciden exactamente con PostgreSQL:
 *
 * ck_od_detalle_superficie
 */
export const toothSurfaceSchema =
  z.enum([
    "COMPLETO",
    "MESIAL",
    "DISTAL",
    "VESTIBULAR",
    "LINGUAL",
    "PALATINO",
    "OCLUSAL",
    "INCISAL",
    "RAIZ",
  ]);


/*
 * =====================================================
 * ESTADOS PERMITIDOS
 * =====================================================
 *
 * Coinciden exactamente con PostgreSQL:
 *
 * ck_od_detalle_estado
 */
export const toothStatusSchema =
  z.enum([
    "SANO",
    "CARIES",
    "RESINA",
    "CORONA",
    "ENDODONCIA",
    "EXTRAIDO",
    "IMPLANTE",
    "PUENTE",
    "SELLANTE",
    "FRACTURA",
    "OTRO",
  ]);


/*
 * =====================================================
 * CREAR DETALLE
 * =====================================================
 */
export const createOdontogramDetailSchema =
  z.object({
    id_diente: z
      .number()
      .int()
      .positive(),

    superficie:
      toothSurfaceSchema
        .default("COMPLETO"),

    estado:
      toothStatusSchema,

    observaciones: z
      .string()
      .trim()
      .max(
        2000,
        "Las observaciones son demasiado largas"
      )
      .optional()
      .nullable(),
  });


/*
 * =====================================================
 * ACTUALIZAR DETALLE
 * =====================================================
 *
 * No permitimos cambiar id_diente desde este PATCH.
 *
 * Podemos cambiar:
 *
 * - superficie
 * - estado
 * - observaciones
 */
export const updateOdontogramDetailSchema =
  z
    .object({
      superficie:
        toothSurfaceSchema
          .optional(),

      estado:
        toothStatusSchema
          .optional(),

      observaciones: z
        .string()
        .trim()
        .max(
          2000,
          "Las observaciones son demasiado largas"
        )
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
 * PARÁMETRO detailId
 * =====================================================
 *
 * req.params siempre llega como string.
 *
 * Por eso usamos coerce para transformarlo
 * a BigInt.
 */
export const odontogramDetailParamsSchema =
  z.object({
    detailId: z.coerce
      .bigint()
      .positive(),
  });