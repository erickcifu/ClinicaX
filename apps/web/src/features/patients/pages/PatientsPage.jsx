import {
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useNavigate,
} from "react-router-dom";

import AddIcon
  from "@mui/icons-material/Add";

import SearchIcon
  from "@mui/icons-material/Search";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getPatients,
} from "../api/patients.api.js";

import PatientCard
  from "../components/PatientCard.jsx";

import CreatePatientDialog
  from "../components/CreatePatientDialog.jsx";

import EditPatientDialog
  from "../components/EditPatientDialog.jsx";  

import {
  useAuth,
} from "../../auth/context/useAuth.js";

export default function PatientsPage() {
  const [search, setSearch] =
    useState("");

  const {
    user,
  } = useAuth();

  const navigate =
  useNavigate();

  const {
    data: patients = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const [
    createDialogOpen,
    setCreateDialogOpen,
  ] = useState(false);

  const [
    patientToEdit,
    setPatientToEdit,
  ] = useState(null);

  const roleCodes =
    user?.roles?.map(
      (role) => role.codigo
    ) || [];

  const canManagePatients =
    roleCodes.includes("ADMIN") ||
    roleCodes.includes("RECEPCION");

  const filteredPatients =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      if (!term) {
        return patients;
      }

      return patients.filter(
        (patient) => {
          const searchableText = [
            patient.nombres,
            patient.apellidos,
            patient.dpi,
            patient.telefono,
            patient.correo,
            patient.codigo_expediente,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            term
          );
        }
      );
    }, [
      patients,
      search,
    ]);

    function handleView(patient) {
      navigate(
        `/patients/${patient.id_paciente}`
      );
    }

  function handleEdit(patient) {
    setPatientToEdit(patient);
  }

  function handleCreate() {
    setCreateDialogOpen(true);
  }

  if (isLoading) {
    return (
      <Box
  sx={{
    maxWidth: 700,
  }}
>
  <TextField
    placeholder="Buscar paciente..."
    value={search}
    onChange={(event) =>
      setSearch(event.target.value)
    }
    fullWidth
    size="small"
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              sx={{
                fontSize: 20,
                color: "text.secondary",
              }}
            />
          </InputAdornment>
        ),
      },
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        backgroundColor: "background.paper",
      },
    }}
  />
</Box>
    );
  }

  return (
    <Stack spacing={3}>
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
>
  <Box>
    <Typography
      variant="h4"
      fontWeight={700}
      sx={{
        fontSize: {
          xs: "1.8rem",
          md: "2rem",
        },
      }}
    >
      Pacientes
    </Typography>

    <Typography
      color="text.secondary"
      sx={{
        mt: 0.25,
        fontSize: "0.95rem",
      }}
    >
      Gestión de pacientes y expedientes clínicos
    </Typography>
  </Box>

  {canManagePatients && (
    <Button
      variant="contained"
      size="medium"
      startIcon={<AddIcon />}
      onClick={handleCreate}
      sx={{
        alignSelf: {
          xs: "stretch",
          sm: "center",
        },
        px: 2,
        py: 1,
        minWidth: 0,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      Nuevo paciente
    </Button>
  )}
</Stack>

      <TextField
        placeholder="Buscar por nombre, DPI, teléfono, correo o expediente..."
        value={search}
        onChange={(event) =>
          setSearch(
            event.target.value
          )
        }
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      {isError && (
        <Alert severity="error">
          {error
            ?.response
            ?.data
            ?.error
            ?.message ||
            "No fue posible cargar los pacientes"}
        </Alert>
      )}

      {!isError &&
        filteredPatients.length ===
          0 && (
          <Alert severity="info">
            {search
              ? "No se encontraron pacientes con esa búsqueda."
              : "Todavía no hay pacientes registrados."}
          </Alert>
        )}

      <Grid
        container
        spacing={2}
      >
        {filteredPatients.map(
          (patient) => (
            <Grid
              key={
                patient.id_paciente
              }
              size={{
                xs: 12,
                md: 6,
                xl: 4,
              }}
            >
              <PatientCard
                patient={patient}
                canEdit={
                  canManagePatients
                }
                onView={
                  handleView
                }
                onEdit={
                  handleEdit
                }
              />
            </Grid>
          )
        )}
      </Grid>
      <CreatePatientDialog
        open={createDialogOpen}
        onClose={() =>
          setCreateDialogOpen(false)
        }
      />
      <EditPatientDialog
        open={Boolean(patientToEdit)}
        patient={patientToEdit}
        onClose={() =>
          setPatientToEdit(null)
        }
      />
    </Stack>
  );
}