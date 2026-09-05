import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import ArrowBackIcon
  from "@mui/icons-material/ArrowBack";

import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getPatient,
} from "../api/patients.api.js";

import MedicalHistoryPanel
  from "../components/MedicalHistoryPanel.jsx";

import DentalHistoryPanel
  from "../components/DentalHistoryPanel.jsx";  

import ConsultationsPanel
  from "../components/ConsultationsPanel.jsx";

import {
  useAuth,
} from "../../auth/context/useAuth.js";


/*
 * Convierte una fecha ISO como:
 * 1995-04-18T00:00:00.000Z
 *
 * en:
 * 18/04/1995
 *
 * Usamos UTC porque fecha_nacimiento es DATE
 * y no queremos que el timezone cambie el día.
 */
function formatDate(value) {
  if (!value) {
    return "No registrada";
  }

  const date =
    new Date(value);

  return new Intl.DateTimeFormat(
    "es-GT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
}

/*
 * Convierte:
 * MASCULINO
 *
 * en:
 * Masculino
 */
function formatSex(value) {
  if (!value) {
    return "No registrado";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).toLowerCase()
  );
}

/*
 * Componente reutilizable para mostrar:
 *
 * DPI
 * 1234567890101
 *
 * Teléfono
 * 5555-2222
 *
 * etc.
 */
function InfoItem({
  label,
  value,
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.4,
        }}
      >
        {label}
      </Typography>

      <Typography
        fontWeight={500}
        sx={{
          wordBreak: "break-word",
        }}
      >
        {value || "No registrado"}
      </Typography>
    </Box>
  );
}


export default function PatientDetailPage() {

  /*
   * Obtenemos /patients/:id
   *
   * Por ejemplo:
   * /patients/2
   *
   * id = "2"
   */
  const {
    id,
  } = useParams();


  /*
   * Control de la pestaña seleccionada.
   *
   * 0 = General
   * 1 = Historia médica
   * 2 = Historia odontológica
   * 3 = Consultas
   * 4 = Odontograma
   * 5 = Tratamientos
   * 6 = Documentos
   */
  const [
    activeTab,
    setActiveTab,
  ] = useState(0);


  /*
   * Navegación de React Router.
   */
  const navigate =
    useNavigate();


  /*
   * Recuperamos usuario autenticado.
   *
   * Esto nos permite saber si puede
   * modificar la historia médica.
   */
  const {
    user,
  } = useAuth();


  /*
   * Extraemos códigos de rol:
   *
   * ["ADMIN", "SUPERADMIN"]
   *
   * o:
   *
   * ["ODONTOLOGO"]
   */
  const roleCodes =
    user?.roles?.map(
      (role) => role.codigo
    ) || [];

    const canCreateConsultation =
      roleCodes.includes(
        "ODONTOLOGO"
      );

  /*
   * Por ahora pueden modificar
   * la historia médica:
   *
   * ADMIN
   * ODONTOLOGO
   */
  const canEditMedicalHistory =
    roleCodes.includes("ADMIN") ||
    roleCodes.includes("ODONTOLOGO");

  const canEditDentalHistory =
    roleCodes.includes("ADMIN") ||
    roleCodes.includes("ODONTOLOGO");


  /*
   * Cargamos la información general
   * del paciente.
   */
  const {
    data: patient,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "patient",
      id,
    ],

    queryFn: () =>
      getPatient(id),

    enabled:
      Boolean(id),
  });


  /*
   * Pantalla mientras carga.
   */
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 350,
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }


  /*
   * Si backend devuelve error
   * como PATIENT_NOT_FOUND.
   */
  if (isError) {
    return (
      <Stack spacing={2}>
        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate("/patients")
          }
          sx={{
            alignSelf: "flex-start",
            textTransform: "none",
          }}
        >
          Volver a pacientes
        </Button>

        <Alert severity="error">
          {error
            ?.response
            ?.data
            ?.error
            ?.message ||
            "No fue posible cargar el paciente"}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>

      {/*
       * BOTÓN VOLVER
       */}
      <Button
        startIcon={
          <ArrowBackIcon />
        }
        onClick={() =>
          navigate("/patients")
        }
        sx={{
          alignSelf: "flex-start",
          textTransform: "none",
          px: 0,
        }}
      >
        Volver a pacientes
      </Button>


      {/*
       * ENCABEZADO DEL PACIENTE
       *
       * Mario Gonzalez Perez     Activo
       * Expediente PAC-001-000002
       */}
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
        spacing={2}
      >
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            flexWrap="wrap"
          >
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                fontSize: {
                  xs: "1.8rem",
                  md: "2.2rem",
                },
              }}
            >
              {patient.nombres}{" "}
              {patient.apellidos}
            </Typography>

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

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Expediente{" "}
            {patient.codigo_expediente}
          </Typography>
        </Box>
      </Stack>


      {/*
       * NAVEGACIÓN DEL EXPEDIENTE
       *
       * Se mantiene visible al hacer scroll.
       */}
      <Box
        sx={{
          position: "sticky",

          top: {
            xs: 64,
            md: 72,
          },

          zIndex: 8,

          bgcolor:
            "background.default",

          pt: 0.5,
          pb: 1,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 1,
          }}
        >
          <Tabs
            value={
              activeTab
            }

            onChange={(
              event,
              newValue
            ) => {
              setActiveTab(
                newValue
              );
            }}

            variant="scrollable"

            scrollButtons="auto"

            allowScrollButtonsMobile

            sx={{
              minHeight: 52,

              "& .MuiTabs-flexContainer":
                {
                  gap: {
                    xs: 0,
                    sm: 0.5,
                  },
                },

              "& .MuiTab-root": {
                minHeight: 52,

                textTransform:
                  "none",

                fontWeight: 600,

                whiteSpace:
                  "nowrap",

                px: {
                  xs: 1.5,
                  sm: 2,
                },

                fontSize: {
                  xs: "0.82rem",
                  sm: "0.9rem",
                },
              },

              "& .MuiTabs-indicator":
                {
                  height: 3,
                  borderRadius: 3,
                },
            }}
          >
            <Tab
              label="General"
            />

            <Tab
              label="Historia médica"
            />

            <Tab
              label="Historia odontológica"
            />

            <Tab
              label="Consultas"
            />

            <Tab
              label="Odontograma"
            />

            <Tab
              label="Tratamientos"
            />

            <Tab
              label="Documentos"
            />
          </Tabs>
        </Card>
      </Box>


      {/*
       * =====================================================
       * PESTAÑA 0
       * INFORMACIÓN GENERAL
       * =====================================================
       */}
      {activeTab === 0 && (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },

              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 3,
                },
              },
            }}
          >
            <Stack spacing={3}>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Información general
              </Typography>

              <Divider />

              <Grid
                container
                spacing={3}
              >

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <InfoItem
                    label="DPI"
                    value={
                      patient.dpi
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <InfoItem
                    label="Fecha de nacimiento"
                    value={
                      formatDate(
                        patient.fecha_nacimiento
                      )
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <InfoItem
                    label="Sexo"
                    value={
                      formatSex(
                        patient.sexo
                      )
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <InfoItem
                    label="Teléfono"
                    value={
                      patient.telefono
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <InfoItem
                    label="Correo"
                    value={
                      patient.correo
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <InfoItem
                    label="Ocupación"
                    value={
                      patient.ocupacion
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <InfoItem
                    label="Dirección"
                    value={
                      patient.direccion
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <InfoItem
                    label="Contacto de emergencia"
                    value={
                      patient
                        .contacto_emergencia
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <InfoItem
                    label="Teléfono de emergencia"
                    value={
                      patient
                        .telefono_emergencia
                    }
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <InfoItem
                    label="Observaciones"
                    value={
                      patient.observaciones
                    }
                  />
                </Grid>

              </Grid>
            </Stack>
          </CardContent>
        </Card>
      )}


      {/*
       * =====================================================
       * PESTAÑA 1
       * HISTORIA MÉDICA
       * =====================================================
       *
       * Aquí cargamos el componente
       * MedicalHistoryPanel.
       *
       * Le enviamos:
       *
       * id del paciente
       * sexo
       * permisos
       */}
      {activeTab === 1 && (
        <MedicalHistoryPanel
          patientId={id}

          patientSex={
            patient.sexo
          }

          canEdit={
            canEditMedicalHistory
          }
        />
      )}


      {/*
       * =====================================================
       * PESTAÑAS QUE TODAVÍA NO IMPLEMENTAMOS
       * =====================================================
       *
       * Esto es temporal.
       *
       * Nos permite mostrar al cliente
       * la estructura futura del sistema.
       */}
      {activeTab === 2 && (
        <DentalHistoryPanel
          patientId={id}
          canEdit={
            canEditDentalHistory
          }
        />
      )}


      {activeTab === 3 && (
        <ConsultationsPanel
          patientId={id}

          patientName={
            `${patient.nombres} ${patient.apellidos}`
          }

          canCreate={
            canCreateConsultation
          }
        />
      )}


      {activeTab === 4 && (
        <Alert severity="info">
          El módulo de Odontograma
          se encuentra en construcción.
        </Alert>
      )}


      {activeTab === 5 && (
        <Alert severity="info">
          El módulo de Tratamientos
          se encuentra en construcción.
        </Alert>
      )}


      {activeTab === 6 && (
        <Alert severity="info">
          El módulo de Documentos
          se encuentra en construcción.
        </Alert>
      )}

    </Stack>
  );
}