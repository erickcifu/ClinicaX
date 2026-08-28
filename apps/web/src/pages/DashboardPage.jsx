import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

const metrics = [
  {
    label: "Citas de hoy",
    value: "0",
  },
  {
    label: "Pacientes",
    value: "0",
  },
  {
    label: "Consultas pendientes",
    value: "0",
  },
  {
    label: "Ingresos del mes",
    value: "Q 0.00",
  },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4">
        Dashboard
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Resumen general de la clínica
      </Typography>

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },

          gap: 2,
        }}
      >
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent>
              <Typography
                color="text.secondary"
                gutterBottom
              >
                {metric.label}
              </Typography>

              <Typography variant="h4">
                {metric.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}