import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import PersonOutlinedIcon
  from "@mui/icons-material/PersonOutlined";

import EditOutlinedIcon
  from "@mui/icons-material/EditOutlined";

import VisibilityOutlinedIcon
  from "@mui/icons-material/VisibilityOutlined";

export default function PatientCard({
  patient,
  canEdit,
  onView,
  onEdit,
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <PersonOutlinedIcon
                  color="primary"
                />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {patient.nombres}{" "}
                  {patient.apellidos}
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Expediente:{" "}
                {patient.codigo_expediente}
              </Typography>
            </Box>

            <Chip
              label={
                patient.activo
                  ? "Activo"
                  : "Inactivo"
              }
              color={
                patient.activo
                  ? "success"
                  : "default"
              }
              size="small"
            />
          </Stack>

          <Divider />

          <Stack spacing={0.5}>
            <Typography
              variant="body2"
            >
              <strong>DPI:</strong>{" "}
              {patient.dpi || "No registrado"}
            </Typography>

            <Typography
              variant="body2"
            >
              <strong>Teléfono:</strong>{" "}
              {patient.telefono ||
                "No registrado"}
            </Typography>

            <Typography
              variant="body2"
            >
              <strong>Correo:</strong>{" "}
              {patient.correo ||
                "No registrado"}
            </Typography>

            <Typography
              variant="body2"
            >
              <strong>Ocupación:</strong>{" "}
              {patient.ocupacion ||
                "No registrada"}
            </Typography>
          </Stack>

          <Divider />

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
          >
            <Button
              variant="outlined"
              startIcon={
                <VisibilityOutlinedIcon />
              }
              onClick={() =>
                onView(patient)
              }
            >
              Ver expediente
            </Button>

            {canEdit && (
              <Button
                startIcon={
                  <EditOutlinedIcon />
                }
                onClick={() =>
                  onEdit(patient)
                }
              >
                Editar
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}