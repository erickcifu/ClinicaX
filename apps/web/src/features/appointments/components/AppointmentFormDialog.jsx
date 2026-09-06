import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAppointment,
  getAppointmentPatients,
} from "../api/appointments.api.js";


function toLocalDateTimeInput(
  value
) {
  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "America/Guatemala",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          false,
      }
    );


  const parts =
    formatter.formatToParts(
      date
    );


  const values = {};

  for (
    const part of parts
  ) {
    if (
      part.type !==
      "literal"
    ) {
      values[
        part.type
      ] =
        part.value;
    }
  }


  return (
    `${values.year}-` +
    `${values.month}-` +
    `${values.day}T` +
    `${values.hour}:` +
    `${values.minute}`
  );
}


function toGuatemalaIso(
  localValue
) {
  if (!localValue) {
    return null;
  }

  return `${localValue}:00-06:00`;
}


export default function AppointmentFormDialog({
  open,
  dentists = [],
  initialStart = null,
  initialEnd = null,
  onClose,
}) {
  const queryClient =
    useQueryClient();


  const [
    patientId,
    setPatientId,
  ] =
    useState("");


  const [
    dentistId,
    setDentistId,
  ] =
    useState("");


  const [
    start,
    setStart,
  ] =
    useState("");


  const [
    end,
    setEnd,
  ] =
    useState("");


  const [
    reason,
    setReason,
  ] =
    useState("");


  const [
    notes,
    setNotes,
  ] =
    useState("");


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");


  const {
    data:
      patients = [],
  } =
    useQuery({
      queryKey: [
        "appointment-patients",
      ],

      queryFn:
        getAppointmentPatients,

      enabled:
        open,
    });


  useEffect(() => {
    if (!open) {
      return;
    }


    setPatientId("");

    setDentistId(
      dentists.length === 1
        ? dentists[0].id_usuario
        : ""
    );

    setStart(
      initialStart
        ? toLocalDateTimeInput(
            initialStart
          )
        : ""
    );

    setEnd(
      initialEnd
        ? toLocalDateTimeInput(
            initialEnd
          )
        : ""
    );

    setReason("");

    setNotes("");

    setErrorMessage("");

  }, [
    open,
    initialStart,
    initialEnd,
    dentists,
  ]);


  const selectedPatient =
    useMemo(
      () =>
        patients.find(
          (patient) =>
            String(
              patient.id_paciente
            ) ===
            String(
              patientId
            )
        ) || null,
      [
        patients,
        patientId,
      ]
    );


  const selectedDentist =
    useMemo(
      () =>
        dentists.find(
          (dentist) =>
            String(
              dentist.id_usuario
            ) ===
            String(
              dentistId
            )
        ) || null,
      [
        dentists,
        dentistId,
      ]
    );


  const mutation =
    useMutation({
      mutationFn:
        async () => {
          const payload = {
            id_paciente:
              patientId,

            id_odontologo:
              dentistId,

            fecha_hora_inicio:
              toGuatemalaIso(
                start
              ),

            motivo:
              reason.trim() ||
              null,

            notas:
              notes.trim() ||
              null,
          };


          if (end) {
            payload.fecha_hora_fin =
              toGuatemalaIso(
                end
              );
          }


          return createAppointment(
            payload
          );
        },


      onSuccess:
        async () => {
          await queryClient
            .invalidateQueries({
              queryKey: [
                "appointments",
              ],
            });


          onClose();
        },


      onError:
        (error) => {
          setErrorMessage(
            error
              ?.response
              ?.data
              ?.error
              ?.message ||
            "No fue posible crear la cita"
          );
        },
    });


  const canSave =
    Boolean(
      patientId &&
      dentistId &&
      start
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
        Nueva cita
      </DialogTitle>


      <DialogContent
        dividers
      >
        <Stack
          spacing={2.5}
        >

          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}


          <Autocomplete
            options={
              patients
            }

            value={
              selectedPatient
            }

            getOptionLabel={(
              patient
            ) =>
              `${patient.nombres || ""} ${patient.apellidos || ""}`.trim()
            }

            isOptionEqualToValue={(
              option,
              value
            ) =>
              String(
                option.id_paciente
              ) ===
              String(
                value.id_paciente
              )
            }

            onChange={(
              event,
              patient
            ) =>
              setPatientId(
                patient
                  ?.id_paciente ||
                ""
              )
            }

            renderInput={(
              params
            ) => (
              <TextField
                {...params}
                label="Paciente"
                required
              />
            )}
          />


          <Autocomplete
            options={
              dentists
            }

            value={
              selectedDentist
            }

            getOptionLabel={(
              dentist
            ) =>
              `${dentist.nombres} ${dentist.apellidos}`
            }

            isOptionEqualToValue={(
              option,
              value
            ) =>
              String(
                option.id_usuario
              ) ===
              String(
                value.id_usuario
              )
            }

            onChange={(
              event,
              dentist
            ) =>
              setDentistId(
                dentist
                  ?.id_usuario ||
                ""
              )
            }

            renderInput={(
              params
            ) => (
              <TextField
                {...params}
                label="Odontólogo"
                required
              />
            )}
          />


          <TextField
            label="Fecha y hora de inicio"
            type="datetime-local"
            value={start}
            onChange={(
              event
            ) =>
              setStart(
                event.target.value
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            required
          />


          <TextField
            label="Fecha y hora de finalización"
            type="datetime-local"
            value={end}
            onChange={(
              event
            ) =>
              setEnd(
                event.target.value
              )
            }
            helperText="Opcional. Si se deja vacío, ClinicAX usa la duración configurada por la clínica."
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />


          <TextField
            label="Motivo"
            value={reason}
            onChange={(
              event
            ) =>
              setReason(
                event.target.value
              )
            }
            fullWidth
          />


          <TextField
            label="Notas"
            value={notes}
            onChange={(
              event
            ) =>
              setNotes(
                event.target.value
              )
            }
            multiline
            minRows={3}
            fullWidth
          />

        </Stack>
      </DialogContent>


      <DialogActions>

        <Button
          onClick={onClose}
          disabled={
            mutation.isPending
          }
        >
          Cancelar
        </Button>


        <Button
          variant="contained"
          disabled={
            !canSave ||
            mutation.isPending
          }
          onClick={() =>
            mutation.mutate()
          }
        >
          {mutation.isPending
            ? "Guardando..."
            : "Crear cita"}
        </Button>

      </DialogActions>

    </Dialog>
  );
}