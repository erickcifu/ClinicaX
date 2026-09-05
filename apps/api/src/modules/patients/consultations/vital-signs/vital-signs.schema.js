import { z } from "zod";

/*
 * Validación para registrar
 * una nueva toma de signos vitales.
 */
export const createVitalSignsSchema =
  z.object({
    presion_sistolica: z
      .number()
      .int()
      .min(40)
      .max(300)
      .optional()
      .nullable(),

    presion_diastolica: z
      .number()
      .int()
      .min(20)
      .max(200)
      .optional()
      .nullable(),

    frecuencia_cardiaca: z
      .number()
      .int()
      .min(20)
      .max(250)
      .optional()
      .nullable(),

    frecuencia_respiratoria: z
      .number()
      .int()
      .min(5)
      .max(80)
      .optional()
      .nullable(),

    temperatura_c: z
      .number()
      .min(30)
      .max(45)
      .optional()
      .nullable(),

    pulso: z
      .number()
      .int()
      .min(20)
      .max(250)
      .optional()
      .nullable(),

    cp: z
      .string()
      .trim()
      .max(50)
      .optional()
      .nullable(),

    observaciones: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .nullable(),
  })
  .refine(
    (data) =>
      Object.values(data).some(
        (value) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      ),
    {
      message:
        "Debe registrar al menos un signo vital",
    }
  );