import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

export default function ClinicCard({
  clinic,
  onEdit,
  onChangeStatus,
}) {
  const statusColor = {
    ACTIVA: "success",
    INACTIVA: "default",
    SUSPENDIDA: "warning",
  };

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <div>
            <Typography variant="h6">
              {clinic.nombre}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {clinic.direccion ||
                "Sin dirección registrada"}
            </Typography>
          </div>

          <Chip
            label={clinic.estado}
            color={
              statusColor[clinic.estado] ||
              "default"
            }
            size="small"
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={0.8}>
          <Typography variant="body2">
            <strong>NIT:</strong>{" "}
            {clinic.nit || "No registrado"}
          </Typography>

          <Typography variant="body2">
            <strong>Teléfono:</strong>{" "}
            {clinic.telefono || "No registrado"}
          </Typography>

          <Typography variant="body2">
            <strong>Correo:</strong>{" "}
            {clinic.correo || "No registrado"}
          </Typography>
        </Stack>
      </CardContent>

      <Divider />

      <CardActions
        sx={{
          px: 2,
          py: 1.5,
          justifyContent: "flex-end",
        }}
      >
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(clinic)}
        >
          Editar
        </Button>

        <Button
          size="small"
          startIcon={<SyncAltIcon />}
          onClick={() =>
            onChangeStatus(clinic)
          }
        >
          Estado
        </Button>
      </CardActions>
    </Card>
  );
}