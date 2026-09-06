import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";


const STATUS_LABELS = {
  PROGRAMADA:
    "Programada",

  CONFIRMADA:
    "Confirmada",

  EN_ESPERA:
    "En espera",

  EN_CONSULTA:
    "En consulta",

  FINALIZADA:
    "Finalizada",

  CANCELADA:
    "Cancelada",

  NO_ASISTIO:
    "No asistió",
};


const STATUS_COLORS = {
  PROGRAMADA:
    "info",

  CONFIRMADA:
    "success",

  EN_ESPERA:
    "warning",

  EN_CONSULTA:
    "primary",

  FINALIZADA:
    "default",

  CANCELADA:
    "error",

  NO_ASISTIO:
    "error",
};


function formatTime(
  value
) {
  if (!value) {
    return "";
  }


  return new Intl.DateTimeFormat(
    "es-GT",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,

      timeZone:
        "America/Guatemala",
    }
  ).format(
    new Date(value)
  );
}


export default function AppointmentCard({
  appointment,
  onClick,
}) {
  const patient =
    appointment.paciente;

  const dentist =
    appointment.odontologo;


  return (
    <Paper
      variant="outlined"

      onClick={() =>
        onClick?.(
          appointment
        )
      }

      sx={{
        p: 2,
        borderRadius: 3,
        cursor:
          onClick
            ? "pointer"
            : "default",

        transition:
          "all 0.15s ease",

        "&:hover":
          onClick
            ? {
                boxShadow: 2,
                transform:
                  "translateY(-1px)",
              }
            : undefined,
      }}
    >
      <Stack spacing={1.5}>

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

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              {formatTime(
                appointment
                  .fecha_hora_inicio
              )}
              {" - "}
              {formatTime(
                appointment
                  .fecha_hora_fin
              )}
            </Typography>


            <Typography
              fontWeight={700}
            >
              {patient
                ? `${patient.nombres} ${patient.apellidos}`
                : "Paciente"}
            </Typography>
          </Box>


          <Chip
            size="small"

            label={
              STATUS_LABELS[
                appointment.estado
              ] ||
              appointment.estado
            }

            color={
              STATUS_COLORS[
                appointment.estado
              ] ||
              "default"
            }
          />

        </Stack>


        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {appointment.motivo ||
              "Sin motivo especificado"}
          </Typography>
        </Box>


        {dentist && (
          <Typography
            variant="body2"
          >
            <strong>
              Odontólogo:
            </strong>{" "}
            {dentist.nombres}{" "}
            {dentist.apellidos}
          </Typography>
        )}


        {appointment.notas && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {appointment.notas}
          </Typography>
        )}

      </Stack>
    </Paper>
  );
}