import { z } from "zod";

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable();

export const updateMedicalHistorySchema =
  z.object({
    motivo_consulta:
      optionalText(2000),

    hospitalizado_ultimos_2_anios:
      z.boolean().optional(),

    detalle_hospitalizacion:
      optionalText(2000),

    tratamiento_medico_ultimos_2_anios:
      z.boolean().optional(),

    detalle_tratamiento_medico:
      optionalText(2000),

    alergia_medicamentos:
      z.boolean().optional(),

    detalle_alergias:
      optionalText(2000),

    hemorragias:
      z.boolean().optional(),

    detalle_hemorragias:
      optionalText(2000),

    medicacion_actual:
      z.boolean().optional(),

    detalle_medicacion_actual:
      optionalText(2000),

    embarazo:
      z.boolean().optional(),

    semanas_embarazo: z
      .number()
      .int()
      .min(0)
      .max(45)
      .optional()
      .nullable(),

    consume_drogas:
      z.boolean().optional(),

    detalle_drogas:
      optionalText(2000),

    medico_cabecera:
      optionalText(150),

    telefono_medico: z
      .string()
      .trim()
      .regex(
        /^\+?[0-9\s()-]{7,20}$/,
        "El teléfono del médico no tiene un formato válido"
      )
      .optional()
      .nullable(),

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