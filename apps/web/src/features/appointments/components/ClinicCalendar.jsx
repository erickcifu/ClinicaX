import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";

import themePlugin from "@fullcalendar/react/themes/monarch";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/blue.css";

import {
  useMemo,
  useRef,
  useState,
} from "react";


export const STATUS_CONFIG = {
  PROGRAMADA: {
    label: "Programada",
    background: "#1976d2",
    text: "#ffffff",
  },

  CONFIRMADA: {
    label: "Confirmada",
    background: "#2e7d32",
    text: "#ffffff",
  },

  EN_ESPERA: {
    label: "En espera",
    background: "#ed6c02",
    text: "#ffffff",
  },

  EN_CONSULTA: {
    label: "En consulta",
    background: "#7b1fa2",
    text: "#ffffff",
  },

  FINALIZADA: {
    label: "Finalizada",
    background: "#607d8b",
    text: "#ffffff",
  },

  CANCELADA: {
    label: "Cancelada",
    background: "#d32f2f",
    text: "#ffffff",
  },

  NO_ASISTIO: {
    label: "No asistió",
    background: "#880e4f",
    text: "#ffffff",
  },
};


function appointmentToEvent(
  appointment
) {
  const patient =
    appointment.paciente;


  return {
    id:
      appointment.id_cita,

    title:
      patient
        ? `${patient.nombres} ${patient.apellidos}`
        : "Paciente",

    start:
      appointment.fecha_hora_inicio,

    end:
      appointment.fecha_hora_fin,

    extendedProps: {
      appointment,
    },
  };
}


export default function ClinicCalendar({
  appointments = [],
  dentists = [],
  selectedDentist = "",
  selectedStatus = "",
  onDentistChange,
  onStatusChange,
  onRangeChange,
  onNewAppointment,
  onAppointmentClick,
  onDateSelect,
}) {
  const calendarRef =
    useRef(null);


  const [
    viewMode,
    setViewMode,
  ] =
    useState(
      "timeGridWeek"
    );


  const [
    title,
    setTitle,
  ] =
    useState("");


  const events =
    useMemo(
      () =>
        appointments.map(
          appointmentToEvent
        ),
      [
        appointments,
      ]
    );


  function getCalendarApi() {
    return calendarRef
      .current
      ?.getApi();
  }


  function goToday() {
    getCalendarApi()
      ?.today();
  }


  function goPrevious() {
    getCalendarApi()
      ?.prev();
  }


  function goNext() {
    getCalendarApi()
      ?.next();
  }


  function changeView(
    event,
    newView
  ) {
    if (!newView) {
      return;
    }

    setViewMode(
      newView
    );

    getCalendarApi()
      ?.changeView(
        newView
      );
  }


  return (
    <Box>

      <Stack
        spacing={2}
        sx={{
          mb: 2.5,
        }}
      >

        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            lg: "center",
          }}
          spacing={2}
        >

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >

            <Button
              variant="outlined"
              onClick={goToday}
              sx={{
                textTransform:
                  "none",

                fontWeight:
                  600,
              }}
            >
              Hoy
            </Button>


            <Button
              variant="outlined"
              onClick={goPrevious}
              sx={{
                minWidth: 42,
                px: 1,
              }}
            >
              <ChevronLeftIcon />
            </Button>


            <Button
              variant="outlined"
              onClick={goNext}
              sx={{
                minWidth: 42,
                px: 1,
              }}
            >
              <ChevronRightIcon />
            </Button>


            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                ml: {
                  xs: 0,
                  sm: 1,
                },

                textTransform:
                  "capitalize",

                whiteSpace:
                  "nowrap",
              }}
            >
              {title}
            </Typography>

          </Stack>


          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              onNewAppointment
            }
            sx={{
              textTransform:
                "none",

              fontWeight:
                700,

              borderRadius:
                2,

              px:
                2.5,
            }}
          >
            Nueva cita
          </Button>

        </Stack>


        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            md: "center",
          }}
          spacing={2}
        >

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={changeView}
            size="small"
          >

            <ToggleButton value="timeGridDay">
              Día
            </ToggleButton>

            <ToggleButton value="timeGridWeek">
              Semana
            </ToggleButton>

            <ToggleButton value="dayGridMonth">
              Mes
            </ToggleButton>

          </ToggleButtonGroup>


          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
          >

            <FormControl
              size="small"
              sx={{
                minWidth: 220,
              }}
            >
              <InputLabel>
                Odontólogo
              </InputLabel>

              <Select
                value={
                  selectedDentist
                }
                label="Odontólogo"
                onChange={(
                  event
                ) =>
                  onDentistChange?.(
                    event.target.value
                  )
                }
              >

                <MenuItem value="">
                  Todos
                </MenuItem>


                {dentists.map(
                  (dentist) => (
                    <MenuItem
                      key={
                        dentist.id_usuario
                      }
                      value={
                        dentist.id_usuario
                      }
                    >
                      {dentist.nombres}{" "}
                      {dentist.apellidos}
                    </MenuItem>
                  )
                )}

              </Select>
            </FormControl>


            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>
                Estado
              </InputLabel>

              <Select
                value={
                  selectedStatus
                }
                label="Estado"
                onChange={(
                  event
                ) =>
                  onStatusChange?.(
                    event.target.value
                  )
                }
              >

                <MenuItem value="">
                  Todos
                </MenuItem>


                {Object.entries(
                  STATUS_CONFIG
                ).map(
                  ([
                    value,
                    config,
                  ]) => (
                    <MenuItem
                      key={value}
                      value={value}
                    >
                      {config.label}
                    </MenuItem>
                  )
                )}

              </Select>
            </FormControl>

          </Stack>

        </Stack>

      </Stack>


      <Box
        sx={{
          backgroundColor:
            "background.paper",

          borderRadius: 4,

          border:
            "1px solid",

          borderColor:
            "divider",

          overflow:
            "hidden",

          boxShadow:
            "0 2px 12px rgba(0,0,0,0.05)",


          "& .fc": {
            fontFamily:
              "inherit",
          },


          "& .fc-toolbar": {
            display:
              "none",
          },


          "& .fc-scrollgrid": {
            border:
              "none",
          },


          "& .fc-col-header-cell": {
            backgroundColor:
              "#f8fafc",

            padding:
              "12px 4px",
          },


          "& .fc-col-header-cell-cushion": {
            textDecoration:
              "none",

            color:
              "text.primary",

            fontWeight:
              700,

            textTransform:
              "uppercase",

            fontSize:
              "0.78rem",
          },


          "& .fc-timegrid-slot": {
            height:
              52,
          },


          "& .fc-timegrid-slot-label": {
            fontSize:
              "0.78rem",

            color:
              "text.secondary",
          },


          "& .fc-day-today": {
            backgroundColor:
              "rgba(25,118,210,0.035) !important",
          },


          "& .fc-daygrid-day-number": {
            textDecoration:
              "none",

            color:
              "text.primary",

            fontWeight:
              700,
          },


          "& .fc-event": {
            cursor:
              "pointer",

            borderRadius:
              "7px",

            border:
              "none",

            padding:
              "3px 5px",

            boxShadow:
              "0 2px 5px rgba(0,0,0,0.14)",

            transition:
              "transform 0.15s ease, box-shadow 0.15s ease",
          },


          "& .fc-event:hover": {
            transform:
              "translateY(-1px)",

            boxShadow:
              "0 4px 10px rgba(0,0,0,0.22)",
          },


          "& .fc-event *": {
            color:
              "inherit !important",
          },


          overflowX:
            "auto",


          "& .fc-view-harness": {
            minWidth: {
              xs:
                760,

              md:
                "auto",
            },
          },
        }}
      >

        <FullCalendar
          ref={
            calendarRef
          }

          plugins={[
            themePlugin,
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}

          initialView="timeGridWeek"

          locale="es"

          firstDay={1}

          allDaySlot={false}

          nowIndicator

          height="auto"

          expandRows

          stickyHeaderDates

          selectable

          selectMirror

          slotMinTime="07:00:00"

          slotMaxTime="20:00:00"

          slotDuration="00:30:00"

          slotLabelInterval="01:00:00"

          events={
            events
          }

          eventDisplay="block"

          slotEventOverlap={false}

          dayMaxEvents={3}


          /*
           * =================================================
           * APLICAR COLOR REAL DEL ESTADO
           * =================================================
           *
           * Lo hacemos directamente sobre el elemento
           * porque el tema Monarch estaba sustituyendo
           * los colores.
           */
          eventDidMount={(
            info
          ) => {
            const appointment =
              info.event
                .extendedProps
                .appointment;


            const config =
              STATUS_CONFIG[
                appointment?.estado
              ] ||
              STATUS_CONFIG.PROGRAMADA;


            info.el.style.setProperty(
              "background-color",
              config.background,
              "important"
            );


            info.el.style.setProperty(
              "border-color",
              config.background,
              "important"
            );


            info.el.style.setProperty(
              "color",
              config.text,
              "important"
            );
          }}


          select={(
            info
          ) => {
            onDateSelect?.({
              start:
                info.start,

              end:
                info.end,

              allDay:
                info.allDay,
            });
          }}


          dateClick={(
            info
          ) => {
            if (
              info.view.type ===
              "dayGridMonth"
            ) {
              onDateSelect?.({
                start:
                  info.date,

                end:
                  null,

                allDay:
                  true,
              });
            }
          }}


          dayHeaderFormat={{
            weekday:
              "short",

            day:
              "numeric",
          }}


          slotLabelFormat={{
            hour:
              "numeric",

            minute:
              "2-digit",

            hour12:
              true,
          }}


          eventTimeFormat={{
            hour:
              "numeric",

            minute:
              "2-digit",

            hour12:
              true,
          }}


          datesSet={(
            info
          ) => {
            setTitle(
              info.view.title
            );


            onRangeChange?.({
              from:
                info.start.toISOString(),

              to:
                info.end.toISOString(),

              view:
                info.view.type,
            });
          }}


          eventClick={(
            info
          ) => {
            onAppointmentClick?.(
              info.event
                .extendedProps
                .appointment
            );
          }}


          eventContent={(
            eventInfo
          ) => {
            const appointment =
              eventInfo.event
                .extendedProps
                .appointment;


            const isMonth =
              eventInfo.view.type ===
              "dayGridMonth";


            if (
              isMonth
            ) {
              return (
                <Box
                  sx={{
                    overflow:
                      "hidden",

                    px:
                      0.25,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    noWrap
                    display="block"
                  >
                    {eventInfo.timeText}{" "}
                    {eventInfo.event.title}
                  </Typography>
                </Box>
              );
            }


            return (
              <Box
                sx={{
                  overflow:
                    "hidden",
                }}
              >

                <Typography
                  variant="caption"
                  fontWeight={800}
                  display="block"
                  noWrap
                >
                  {eventInfo.timeText}
                </Typography>


                <Typography
                  variant="caption"
                  fontWeight={700}
                  display="block"
                  noWrap
                >
                  {eventInfo.event.title}
                </Typography>


                {appointment
                  ?.odontologo && (
                  <Typography
                    variant="caption"
                    display="block"
                    noWrap
                    sx={{
                      opacity:
                        0.85,
                    }}
                  >
                    Dr.{" "}
                    {
                      appointment
                        .odontologo
                        .nombres
                    }
                  </Typography>
                )}

              </Box>
            );
          }}
        />

      </Box>


      {/*
       * =====================================================
       * LEYENDA
       * =====================================================
       */}
      <Box
        sx={{
          mt: 2,
          px: 1,
        }}
      >

        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            mb: 1,
          }}
        >
          Estados de las citas
        </Typography>


        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
        >

          {Object.entries(
            STATUS_CONFIG
          ).map(
            ([
              key,
              config,
            ]) => (
              <Chip
                key={key}
                size="small"
                label={
                  config.label
                }
                sx={{
                  backgroundColor:
                    config.background,

                  color:
                    config.text,

                  fontWeight:
                    700,

                  "& .MuiChip-label": {
                    px: 1.25,
                  },
                }}
              />
            )
          )}

        </Stack>

      </Box>

    </Box>
  );
}