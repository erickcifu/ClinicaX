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
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

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

import {
  WHATSAPP_CONFIG,
} from "../config/whatsapp.config.js";


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
 * TRANSICIONES SEGÚN ROL
 * ============================================================
 *
 * RECEPCIÓN:
 * - Confirma citas.
 * - Envía a espera.
 * - Puede cancelar.
 * - Puede marcar no asistió.
 *
 * ODONTÓLOGO:
 * - NO puede poner "En espera".
 * - Su principal flujo es:
 *
 *      CONFIRMADA
 *          ↓
 *      EN_CONSULTA
 *          ↓
 *      FINALIZADA
 *
 * ADMIN:
 * Tiene control completo de la agenda.
 *
 * SUPERADMIN:
 * También tiene control completo.
 *
 * ASISTENTE:
 * Puede manejar el flujo operativo de llegada,
 * pero no finalizar una consulta.
 */

const ROLE_TRANSITIONS = {
  ADMIN: {
    PROGRAMADA: [
      "CONFIRMADA",
      "EN_ESPERA",
      "EN_CONSULTA",
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
  },

  SUPERADMIN: {
    PROGRAMADA: [
      "CONFIRMADA",
      "EN_ESPERA",
      "EN_CONSULTA",
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
  },

  RECEPCION: {
    PROGRAMADA: [
      "CONFIRMADA",
      "EN_ESPERA",
      "CANCELADA",
      "NO_ASISTIO",
    ],

    CONFIRMADA: [
      "EN_ESPERA",
      "CANCELADA",
      "NO_ASISTIO",
    ],

    EN_ESPERA: [
      "CANCELADA",
      "NO_ASISTIO",
    ],

    EN_CONSULTA: [],
  },

  ASISTENTE: {
    PROGRAMADA: [
      "CONFIRMADA",
      "EN_ESPERA",
      "CANCELADA",
      "NO_ASISTIO",
    ],

    CONFIRMADA: [
      "EN_ESPERA",
      "NO_ASISTIO",
    ],

    EN_ESPERA: [
      "NO_ASISTIO",
    ],

    EN_CONSULTA: [],
  },

  ODONTOLOGO: {
    PROGRAMADA: [],

    CONFIRMADA: [
      "EN_CONSULTA",
    ],

    EN_ESPERA: [
      "EN_CONSULTA",
    ],

    EN_CONSULTA: [
      "FINALIZADA",
    ],
  },

  PACIENTE: {
    PROGRAMADA: [],
    CONFIRMADA: [],
    EN_ESPERA: [],
    EN_CONSULTA: [],
    FINALIZADA: [],
    CANCELADA: [],
    NO_ASISTIO: [],
  },
};


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
 * WHATSAPP
 * ============================================================
 */

function getPatientPhone(
  appointment
) {
  const patient =
    appointment?.paciente;

  if (!patient) {
    return "";
  }

  /*
   * Dependiendo de cómo esté definido el paciente
   * en la respuesta del backend, intentamos encontrar
   * el teléfono en los campos habituales.
   *
   * Cuando consolidemos el modelo del backend podemos
   * dejar solamente el campo definitivo.
   */
  const phone =
    patient.telefono ||
    patient.telefono_celular ||
    patient.celular ||
    patient.whatsapp ||
    "";

  return String(phone)
    .replace(/\D/g, "");
}


function createWhatsAppMessage(
  appointment
) {
  const patient =
    appointment?.paciente;

  const patientName =
    patient
      ? `${patient.nombres} ${patient.apellidos}`
      : "Paciente";

  const dentistName =
    appointment?.odontologo
      ? `${appointment.odontologo.nombres} ${appointment.odontologo.apellidos}`
      : "su odontólogo";

  const appointmentDate =
    appointment?.fecha_hora_inicio
      ? new Intl.DateTimeFormat(
          "es-GT",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone:
              "America/Guatemala",
          }
        ).format(
          new Date(
            appointment.fecha_hora_inicio
          )
        )
      : "";

  const appointmentTime =
    appointment?.fecha_hora_inicio
      ? new Intl.DateTimeFormat(
          "es-GT",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone:
              "America/Guatemala",
          }
        ).format(
          new Date(
            appointment.fecha_hora_inicio
          )
        )
      : "";

  return [
    `Hola ${patientName}, le escribimos de ClinicAX para confirmar su cita odontológica.`,

    "",

    `📅 Fecha: ${appointmentDate}`,

    `🕐 Hora: ${appointmentTime}`,

    `👨‍⚕️ Odontólogo: ${dentistName}`,

    appointment?.motivo
      ? `🦷 Motivo: ${appointment.motivo}`
      : null,

    "",

    "Por favor responda este mensaje indicando:",

    "CONFIRMO",

    "si podrá asistir a su cita.",

    "",

    "Si necesita reprogramarla o tiene alguna duda, puede responder directamente a este mensaje.",

    "",

    "Gracias por confiar en nosotros.",
  ]
    .filter(
      (line) =>
        line !== null
    )
    .join("\n");
}


function createWhatsAppUrl(
  appointment
) {
  const patientPhone =
    getPatientPhone(
      appointment
    );

  /*
   * Si el paciente tiene teléfono,
   * abrimos la conversación directamente.
   *
   * Si no tiene teléfono, utilizamos
   * el número temporal configurado.
   */
  const phone =
    patientPhone ||
    WHATSAPP_CONFIG.TEST_NUMBER;

  const message =
    createWhatsAppMessage(
      appointment
    );

  return (
    `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`
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
          return role;
        }

        return (
          role?.codigo ||
          role?.code ||
          role?.rol ||
          role?.name ||
          role?.nombre ||
          ""
        );
      })
      .filter(Boolean);
  }

  if (user.role) {
    return [user.role];
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

        /*
         * SUPERADMIN y ADMIN
         * tienen prioridad si están presentes.
         */
        const privilegedRole =
          userRoles.find(
            (role) =>
              role === "SUPERADMIN" ||
              role === "ADMIN"
          );

        if (privilegedRole) {
          return [
            currentState,

            ...(
              ROLE_TRANSITIONS[
                privilegedRole
              ]?.[
                currentState
              ] ||
              STATE_TRANSITIONS[
                currentState
              ] ||
              []
            ),
          ];
        }

        /*
         * Para el resto buscamos
         * la primera transición disponible.
         */
        const roleTransitions =
          userRoles
            .map(
              (role) =>
                ROLE_TRANSITIONS[
                  role
                ]?.[
                  currentState
                ] || []
            )
            .find(
              (transitions) =>
                transitions.length > 0
            ) || [];

        return [
          currentState,
          ...roleTransitions,
        ];
      },
      [
        appointment,
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


  const patientPhone =
    getPatientPhone(
      appointment
    );


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
              WHATSAPP
              ================================================= */}

          <Box>

            <Typography
              fontWeight={700}
              sx={{
                mb: 1,
              }}
            >
              Confirmación por WhatsApp
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
              }}
            >
              Envía al paciente un mensaje preparado
              con los datos de su cita para que pueda
              confirmar su asistencia.
            </Typography>


            <Button
              variant="outlined"
              startIcon={
                <WhatsAppIcon />
              }
              onClick={() => {
                window.open(
                  createWhatsAppUrl(
                    appointment
                  ),
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              sx={{
                textTransform:
                  "none",

                borderRadius:
                  2,

                fontWeight:
                  700,
              }}
            >
              {
                patientPhone
                  ? "Enviar confirmación por WhatsApp"
                  : "Abrir WhatsApp con mensaje preparado"
              }
            </Button>

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