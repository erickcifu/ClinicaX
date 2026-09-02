import { z } from "zod";

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable();

export const updateDentalHistorySchema =
  z
    .object({
      ulceras_bucales:
        z.boolean().optional(),

      dolor_dentario:
        z.boolean().optional(),

      gingivorragia:
        z.boolean().optional(),

      infecciones_orales:
        z.boolean().optional(),

      reaccion_anestesia:
        z.boolean().optional(),

      detalle_reaccion_anestesia:
        optionalText(2000),

      habitos:
        optionalText(2000),

      motivo_ultima_consulta_dental:
        optionalText(2000),

      historia_tratamientos_previos:
        optionalText(3000),

      observaciones:
        optionalText(3000),
    })
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "Debe enviar al menos un campo para actualizar",
      }
    );