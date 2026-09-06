import { z } from "zod";


/*
 * =====================================================
 * ESTADOS PERMITIDOS
 * =====================================================
 *
 * Coinciden EXACTAMENTE con:
 *
 * ck_citas_estado
 */
export const APPOINTMENT_STATES = [
  "PROGRAMADA",
  "CONFIRMADA",
  "EN_ESPERA",
  "EN_CONSULTA",
  "FINALIZADA",
  "CANCELADA",
  "NO_ASISTIO",
];


export const appointmentStateSchema =
  z.enum(
    APPOINTMENT_STATES
  );


/*
 * =====================================================
 * CREAR CITA
 * =====================================================
 *
 * fecha_hora_fin es opcional.
 *
 * Si no viene:
 *
 * utilizaremos duracion_cita_minutos
 * de configuracion_clinica.
 */
export const createAppointmentSchema =
  z.object({
    id_paciente: z.coerce
      .bigint()
      .positive(),

    id_odontologo: z.coerce
      .bigint()
      .positive(),

    fecha_hora_inicio: z.coerce
      .date(),

    fecha_hora_fin: z.coerce
      .date()
      .optional(),

    motivo: z
      .string()
      .trim()
      .max(
        2000,
        "El motivo es demasiado largo"
      )
      .optional()
      .nullable(),

    notas: z
      .string()
      .trim()
      .max(
        3000,
        "Las notas son demasiado largas"
      )
      .optional()
      .nullable(),

    estado:
      appointmentStateSchema
        .default(
          "PROGRAMADA"
        ),
  })
  .refine(
    (data) => {
      if (
        !data.fecha_hora_fin
      ) {
        return true;
      }

      return (
        data.fecha_hora_fin >
        data.fecha_hora_inicio
      );
    },
    {
      message:
        "La fecha de finalización debe ser posterior a la fecha de inicio",

      path: [
        "fecha_hora_fin",
      ],
    }
  );


/*
 * =====================================================
 * ACTUALIZAR / REPROGRAMAR CITA
 * =====================================================
 */
export const updateAppointmentSchema =
  z
    .object({
      id_paciente: z.coerce
        .bigint()
        .positive()
        .optional(),

      id_odontologo: z.coerce
        .bigint()
        .positive()
        .optional(),

      fecha_hora_inicio: z.coerce
        .date()
        .optional(),

      fecha_hora_fin: z.coerce
        .date()
        .optional(),

      motivo: z
        .string()
        .trim()
        .max(2000)
        .nullable()
        .optional(),

      notas: z
        .string()
        .trim()
        .max(3000)
        .nullable()
        .optional(),

      estado:
        appointmentStateSchema
          .optional(),
    })
    .refine(
      (data) =>
        Object.keys(
          data
        ).length > 0,
      {
        message:
          "Debe enviar al menos un campo para actualizar",
      }
    );


/*
 * =====================================================
 * ID DE CITA
 * =====================================================
 */
export const appointmentParamsSchema =
  z.object({
    appointmentId: z.coerce
      .bigint()
      .positive(),
  });


/*
 * =====================================================
 * FILTROS GET AGENDA
 * =====================================================
 *
 * Ejemplos:
 *
 * ?from=2026-09-04T00:00:00-06:00
 * &to=2026-09-05T00:00:00-06:00
 *
 * ?dentistId=1
 *
 * ?patientId=2
 *
 * ?status=PROGRAMADA
 */
export const appointmentQuerySchema =
  z
    .object({
      from: z.coerce
        .date()
        .optional(),

      to: z.coerce
        .date()
        .optional(),

      dentistId: z.coerce
        .bigint()
        .positive()
        .optional(),

      patientId: z.coerce
        .bigint()
        .positive()
        .optional(),

      status:
        appointmentStateSchema
          .optional(),
    })
    .refine(
      (data) => {
        if (
          data.from &&
          data.to
        ) {
          return (
            data.to >
            data.from
          );
        }

        return true;
      },
      {
        message:
          "El final del rango debe ser posterior al inicio",

        path: [
          "to",
        ],
      }
    );