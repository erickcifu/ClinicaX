import { z } from "zod";

export const updateClinicSettingsSchema = z
  .object({
    duracion_cita_minutos: z
      .number()
      .int("La duración debe ser un número entero")
      .min(5, "La duración mínima es de 5 minutos")
      .max(240, "La duración máxima es de 240 minutos")
      .optional(),

    horas_recordatorio: z
      .number()
      .int("Las horas de recordatorio deben ser un número entero")
      .min(0, "Las horas de recordatorio no pueden ser negativas")
      .max(720, "Las horas de recordatorio son demasiado altas")
      .optional(),

    permite_portal_paciente: z
      .boolean()
      .optional(),

    moneda: z
      .string()
      .trim()
      .length(3, "La moneda debe utilizar un código de 3 caracteres")
      .transform((value) => value.toUpperCase())
      .optional(),

    configuracion_extra: z
      .record(z.string(), z.unknown())
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Debe enviar al menos una configuración para actualizar",
    }
  );