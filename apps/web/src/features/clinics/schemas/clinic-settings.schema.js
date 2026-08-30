import { z } from "zod";

export const clinicSettingsSchema = z.object({
  duracion_cita_minutos: z
    .number({
      message: "La duración debe ser numérica",
    })
    .int("La duración debe ser un número entero")
    .min(5, "La duración mínima es de 5 minutos")
    .max(240, "La duración máxima es de 240 minutos"),

  horas_recordatorio: z
    .number({
      message: "Las horas deben ser numéricas",
    })
    .int("Las horas deben ser un número entero")
    .min(0, "No puede ser negativo")
    .max(720, "El valor es demasiado alto"),

  permite_portal_paciente: z.boolean(),

  moneda: z.enum(
    ["GTQ", "USD", "EUR", "MXN"],
    {
      message: "Seleccione una moneda válida",
    }
  ),
});