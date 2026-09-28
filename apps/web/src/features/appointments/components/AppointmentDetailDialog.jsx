import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateAppointment,
} from "../api/appointments.api.js";

import {
  STATUS_CONFIG,
} from "./ClinicCalendar.jsx";

import {
  useAuth,
} from "../../auth/context/useAuth.js";


/*
 * ============================================================
 * TRANSICIONES GENERALES
 * ============================================================
 *
 * Estas son las transiciones válidas del flujo de Agenda.
 *
 * IMPORTANTE:
 * No significa que todos los roles puedan ejecutar todas.
 *
 * Más abajo se define qué puede hacer cada rol.
 */

const STATE_TRANSITIONS = {
  PROGRAMADA: [
    "CONFIRMADA",
    "EN_ESPERA",
    "CANCELADA",
    "NO_ASISTIO",
  ],

  CONFIRMADA: [
    "EN_ESPERA",
    "EN_CONSULTA",
    "CANCELADA",
    "NO_ASISTIO",
  ],

  EN_ESPERA: [
    "EN_CONSULTA",
    "CANCELADA",
    "NO_ASISTIO",
  ],

  EN_CONSULTA: [
    "FINALIZADA",
  ],

  FINALIZADA: [],

  CANCELADA: [],

  NO_ASISTIO: [],
};


/*
 * ============================================================
 * PERMISOS DE ESTADO SEGÚN ROL
 * ============================================================
 *
 * El backend actual aplica estas reglas:
 *
 * - ADMIN / SUPERADMIN / RECEPCION: pueden administrar el
 *   estado de cualquier cita de su clínica.
 * - ODONTOLOGO / ASISTENTE: solo pueden cambiar el estado
 *   de sus propias citas y únicamente envían el campo estado.
 * - PACIENTE: no puede cambiar estados.
 *
 * Las transiciones válidas siguen siendo las definidas en
 * STATE_TRANSITIONS. El frontend solo filtra las que el usuario
 * realmente puede solicitar; el backend sigue siendo la autoridad.
 */
const STATE_MANAGEMENT_ROLES = [
  "ADMIN",
  "SUPERADMIN",
  "RECEPCION",
];


/*
 * ============================================================
 * FECHA
 * ============================================================
 */

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "es-GT",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Guatemala",
    }
  ).format(
    new Date(value)
  );
}


/*
 * ============================================================
 * GOOGLE CALENDAR
 * ============================================================
 */

function toGoogleDate(value) {
  return new Date(value)
    .toISOString()
    .replace(
      /[-:]/g,
      ""
    )
    .replace(
      /.\d{3}Z$/,
      "Z"
    );
}


function createGoogleCalendarUrl(
  appointment
) {
  const patient =
    appointment.paciente;

  const patientName =
    patient
      ? `${patient.nombres} ${patient.apellidos}`
      : "Paciente";

  const title =
    `Cita odontológica - ${patientName}`;

  const details = [
    appointment.motivo ||
      "Cita odontológica",

    appointment.odontologo
      ? `Odontólogo: ${appointment.odontologo.nombres} ${appointment.odontologo.apellidos}`
      : null,

    appointment.notas
      ? `Notas: ${appointment.notas}`
      : null,

    "Agendada desde ClinicAX",
  ]
    .filter(Boolean)
    .join("\n");

  const params =
    new URLSearchParams({
      action: "TEMPLATE",

      text: title,

      dates:
        `${toGoogleDate(
          appointment.fecha_hora_inicio
        )}/${toGoogleDate(
          appointment.fecha_hora_fin
        )}`,

      details,
    });

  return (
    `https://calendar.google.com/calendar/render?${params.toString()}`
  );
}


/*
 * ============================================================
 * ROLES
 * ============================================================
 */

function getUserRoles(user) {
  if (!user) {
    return [];
  }

  if (Array.isArray(user.roles)) {
    return user.roles
      .map((role) => {
        if (typeof role === "string") {
          return role.trim().toUpperCase();
        }

        return String(
          role?.codigo ||
          role?.code ||
          role?.rol ||
          role?.name ||
          role?.nombre ||
          ""
        )
          .trim()
          .toUpperCase();
      })
      .filter(Boolean);
  }

  if (user.role) {
    return [
      String(user.role)
        .trim()
        .toUpperCase(),
    ];
  }

  return [];
}


export default function AppointmentDetailDialog({
  open,
  appointment,
  onClose,
  onAppointmentUpdated,
}) {
  const queryClient =
    useQueryClient();

  const {
    user,
  } =
    useAuth();

  const [
    selectedState,
    setSelectedState,
  ] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  useEffect(() => {
    if (
      open &&
      appointment
    ) {
      setSelectedState(
        appointment.estado
      );

      setErrorMessage("");
    }
  }, [
    open,
    appointment,
  ]);


  /*
   * ==========================================================
   * ROL DEL USUARIO
   * ==========================================================
   */

  const userRoles =
    useMemo(
      () =>
        getUserRoles(
          user
        ),
      [user]
    );


  /*
   * ==========================================================
   * ESTADOS DISPONIBLES SEGÚN ROL
   * ==========================================================
   */

  const availableStates =
    useMemo(
      () => {
        if (!appointment) {
          return [];
        }

        const currentState =
          appointment.estado;

        const hasStateManagementRole =
          userRoles.some((role) =>
            STATE_MANAGEMENT_ROLES.includes(role)
          );

        const isOwnAppointment =
          String(appointment.id_odontologo || "") ===
          String(user?.id_usuario || user?.id || "");

        /*
         * Los roles administrativos pueden administrar
         * cualquier cita de la clínica.
         */
        if (hasStateManagementRole) {
          return [
            currentState,
            ...(STATE_TRANSITIONS[currentState] || []),
          ];
        }

        /*
         * Los roles clínicos no administrativos solo pueden
         * operar sus propias citas.
         */
        const canOperateOwnAppointment =
          userRoles.includes("ODONTOLOGO") ||
          userRoles.includes("ASISTENTE");

        if (
          canOperateOwnAppointment &&
          isOwnAppointment
        ) {
          return [
            currentState,
            ...(STATE_TRANSITIONS[currentState] || []),
          ];
        }

        return [currentState];
      },
      [
        appointment,
        user,
        userRoles,
      ]
    );


  const currentStatus =
    STATUS_CONFIG[
      appointment?.estado
    ];


  /*
   * ==========================================================
   * MUTACIÓN
   * ==========================================================
   */

  const mutation =
    useMutation({
      mutationFn:
        async () => {
          return updateAppointment(
            appointment.id_cita,
            {
              estado:
                selectedState,
            }
          );
        },

      onSuccess:
        async (
          updatedAppointment
        ) => {
          await queryClient.invalidateQueries({
            queryKey: [
              "appointments",
            ],
          });

          setErrorMessage("");

          onAppointmentUpdated?.(
            updatedAppointment
          );
        },

      onError:
        (error) => {
          setErrorMessage(
            error
              ?.response
              ?.data
              ?.error
              ?.message ||
              "No fue posible cambiar el estado de la cita"
          );

          setSelectedState(
            appointment.estado
          );
        },
    });


  if (!appointment) {
    return null;
  }


  const canChangeState =
    availableStates.length >
    1;

  const stateChanged =
    selectedState !==
    appointment.estado;




  return (
    <Dialog
      open={open}
      onClose={
        mutation.isPending
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={1}
        >

          <Typography
            variant="h6"
            fontWeight={800}
          >
            Detalle de cita
          </Typography>

          {currentStatus && (
            <Chip
              label={
                currentStatus.label
              }
              sx={{
                backgroundColor:
                  currentStatus.background,

                color:
                  currentStatus.text,

                fontWeight:
                  700,
              }}
            />
          )}

        </Stack>

      </DialogTitle>


      <DialogContent
        dividers
      >

        <Stack spacing={2.5}>

          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Paciente
            </Typography>

            <Typography
              variant="h6"
              fontWeight={700}
            >
              {
                appointment
                  .paciente
                  ?.nombres
              }{" "}
              {
                appointment
                  .paciente
                  ?.apellidos
              }
            </Typography>
          </Box>


          <Divider />


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Inicio
            </Typography>

            <Typography>
              {formatDateTime(
                appointment
                  .fecha_hora_inicio
              )}
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Finalización
            </Typography>

            <Typography>
              {formatDateTime(
                appointment
                  .fecha_hora_fin
              )}
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Odontólogo
            </Typography>

            <Typography>
              {
                appointment
                  .odontologo
                  ?.nombres
              }{" "}
              {
                appointment
                  .odontologo
                  ?.apellidos
              }
            </Typography>
          </Box>


          {appointment.motivo && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Motivo
              </Typography>

              <Typography>
                {
                  appointment.motivo
                }
              </Typography>
            </Box>
          )}


          {appointment.notas && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Notas
              </Typography>

              <Typography>
                {
                  appointment.notas
                }
              </Typography>
            </Box>
          )}


          <Divider />


          {/* =================================================
              CAMBIO DE ESTADO
              ================================================= */}

          <Box>

            <Typography
              fontWeight={700}
              sx={{
                mb: 1.5,
              }}
            >
              Estado de la cita
            </Typography>


            {!canChangeState && (
              <Alert severity="info">
                Esta cita no tiene acciones disponibles
                para tu rol en este momento.
              </Alert>
            )}


            {canChangeState && (
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
                alignItems={{
                  xs: "stretch",
                  sm: "center",
                }}
              >

                <FormControl
                  size="small"
                  fullWidth
                >

                  <InputLabel>
                    Estado
                  </InputLabel>

                  <Select
                    value={
                      selectedState
                    }
                    label="Estado"
                    onChange={(
                      event
                    ) =>
                      setSelectedState(
                        event.target.value
                      )
                    }
                    disabled={
                      mutation.isPending
                    }
                  >

                    {availableStates.map(
                      (state) => (
                        <MenuItem
                          key={state}
                          value={state}
                        >
                          {
                            STATUS_CONFIG[
                              state
                            ]?.label ||
                            state
                          }
                        </MenuItem>
                      )
                    )}

                  </Select>

                </FormControl>


                <Button
                  variant="contained"
                  disabled={
                    !stateChanged ||
                    mutation.isPending
                  }
                  onClick={() =>
                    mutation.mutate()
                  }
                  sx={{
                    whiteSpace:
                      "nowrap",

                    textTransform:
                      "none",
                  }}
                >
                  {
                    mutation.isPending
                      ? "Guardando..."
                      : "Cambiar estado"
                  }
                </Button>

              </Stack>
            )}

          </Box>


          <Divider />


          {/* =================================================
              RECORDATORIOS AUTOMÁTICOS
              ================================================= */}

          <Box>

            <Typography
              fontWeight={700}
              sx={{
                mb: 1,
              }}
            >
              Recordatorios automáticos
            </Typography>

            <Alert
              severity="info"
              sx={{
                alignItems: "flex-start",
              }}
            >
              Los recordatorios de la cita serán enviados
              automáticamente por el sistema según la
              configuración de la clínica.
            </Alert>

          </Box>


          <Divider />


          <Button
            variant="outlined"
            startIcon={
              <CalendarMonthIcon />
            }
            onClick={() => {
              window.open(
                createGoogleCalendarUrl(
                  appointment
                ),
                "_blank",
                "noopener,noreferrer"
              );
            }}
            sx={{
              alignSelf:
                "flex-start",

              textTransform:
                "none",
            }}
          >
            Agregar a Google Calendar
          </Button>

        </Stack>

      </DialogContent>


      <DialogActions>

        <Button
          onClick={onClose}
          disabled={
            mutation.isPending
          }
        >
          Cerrar
        </Button>

      </DialogActions>

    </Dialog>
  );
}