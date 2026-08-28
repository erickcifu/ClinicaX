import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";

import { getClinics } from "../api/clinics.api.js";

import ClinicCard from "../components/ClinicCard.jsx";
import CreateClinicDialog from "../components/CreateClinicDialog.jsx";

export default function ClinicsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const {
    data: clinics = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["clinics"],
    queryFn: getClinics,
  });

  if (isPending) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    console.error(error);

    return (
      <Alert severity="error">
        No fue posible cargar las clínicas.
        Verifica que ClinicAX API esté ejecutándose.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">
            Clínicas
          </Typography>

          <Typography color="text.secondary">
            Administración de clínicas registradas
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddBusinessIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Nueva clínica
        </Button>
      </Stack>

      {clinics.length === 0 ? (
        <Alert severity="info">
          No existen clínicas registradas.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              xl: "repeat(3, 1fr)",
            },

            gap: 2,
          }}
        >
          {clinics.map((clinic) => (
            <ClinicCard
              key={clinic.id_clinica}
              clinic={clinic}
            />
          ))}
        </Box>
      )}

      <CreateClinicDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}