import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaletteIcon from "@mui/icons-material/Palette";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  getClinicSettings,
  updateClinicSettings,
} from "../api/clinics.api.js";

import {
  clinicSettingsSchema,
} from "../schemas/clinic-settings.schema.js";

import {
  defaultBranding,
} from "../../../theme/branding.js";

export default function ClinicSettingsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] =
    useState(0);

  const [branding, setBranding] =
    useState({
      primary:
        defaultBranding.colors.primary,

      secondary:
        defaultBranding.colors.secondary,

      mode: "light",
    });

  const {
    register,
    handleSubmit,
    reset,
    control,

    formState: {
      errors,
      isDirty,
    },
  } = useForm({
    resolver: zodResolver(
      clinicSettingsSchema
    ),

    defaultValues: {
      duracion_cita_minutos: 30,
      horas_recordatorio: 24,
      permite_portal_paciente: true,
      moneda: "GTQ",
    },
  });

  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "clinic-settings",
      id,
    ],

    queryFn: () =>
      getClinicSettings(id),

    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!data?.settings) {
      return;
    }

    reset({
      duracion_cita_minutos:
        data.settings
          .duracion_cita_minutos ?? 30,

      horas_recordatorio:
        data.settings
          .horas_recordatorio ?? 24,

      permite_portal_paciente:
        data.settings
          .permite_portal_paciente ?? true,

      moneda:
        data.settings.moneda ?? "GTQ",
    });

    const savedBranding =
      data.settings
        .configuracion_extra
        ?.branding;

    if (savedBranding) {
      setBranding({
        primary:
          savedBranding.primary ||
          defaultBranding.colors.primary,

        secondary:
          savedBranding.secondary ||
          defaultBranding.colors.secondary,

        mode:
          savedBranding.mode ||
          "light",
      });
    }
  }, [
    data,
    reset,
  ]);

  const agendaMutation =
    useMutation({
      mutationFn: (formData) =>
        updateClinicSettings(
          id,
          formData
        ),

      onSuccess: async () => {
        await queryClient
          .invalidateQueries({
            queryKey: [
              "clinic-settings",
              id,
            ],
          });
      },
    });

  const appearanceMutation =
    useMutation({
      mutationFn: async () => {
        const currentExtra =
          data?.settings
            ?.configuracion_extra;

        const extra =
          currentExtra &&
          typeof currentExtra ===
            "object" &&
          !Array.isArray(currentExtra)
            ? currentExtra
            : {};

        return updateClinicSettings(
          id,
          {
            configuracion_extra: {
              ...extra,

              branding: {
                primary:
                  branding.primary,

                secondary:
                  branding.secondary,

                mode:
                  branding.mode,
              },
            },
          }
        );
      },

      onSuccess: async () => {
        await queryClient
          .invalidateQueries({
            queryKey: [
              "clinic-settings",
              id,
            ],
          });
      },
    });

  function onSubmitAgenda(
    formData
  ) {
    agendaMutation.mutate(
      formData
    );
  }

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
        No fue posible cargar la
        configuración de la clínica.
      </Alert>
    );
  }

  const clinic = data?.clinic;

  return (
    <Box>
      <Button
        startIcon={
          <ArrowBackIcon />
        }
        onClick={() =>
          navigate("/clinics")
        }
        sx={{ mb: 2 }}
      >
        Volver a clínicas
      </Button>

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">
            Configuración
          </Typography>

          <Typography
            color="text.secondary"
          >
            {clinic?.nombre}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {clinic?.zona_horaria}
        </Typography>
      </Stack>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(
            event,
            newValue
          ) =>
            setActiveTab(
              newValue
            )
          }
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: 1,
            borderColor:
              "divider",
          }}
        >
          <Tab label="General" />

          <Tab label="Agenda" />

          <Tab label="Apariencia" />
        </Tabs>

        <CardContent>
          {/* ========================
              GENERAL
          ======================== */}

          {activeTab === 0 && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
              >
                Información general
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Información básica de
                la clínica.
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Nombre"
                  value={
                    clinic?.nombre ||
                    ""
                  }
                  fullWidth
                  disabled
                />

                <TextField
                  label="Zona horaria"
                  value={
                    clinic
                      ?.zona_horaria ||
                    ""
                  }
                  fullWidth
                  disabled
                />

                <TextField
                  label="Estado"
                  value={
                    clinic?.estado ||
                    ""
                  }
                  fullWidth
                  disabled
                />

                <Alert severity="info">
                  Por ahora estos datos
                  se modifican desde la
                  opción Editar de la
                  clínica. Más adelante
                  centralizaremos toda la
                  configuración aquí.
                </Alert>
              </Stack>
            </Box>
          )}

          {/* ========================
              AGENDA
          ======================== */}

          {activeTab === 1 && (
            <Box
              component="form"
              onSubmit={handleSubmit(
                onSubmitAgenda
              )}
            >
              <Typography
                variant="h6"
                gutterBottom
              >
                Agenda y operación
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Configuración utilizada
                para citas,
                recordatorios y portal
                del paciente.
              </Typography>

              <Divider
                sx={{ my: 3 }}
              />

              {agendaMutation
                .isSuccess && (
                <Alert
                  severity="success"
                  sx={{ mb: 3 }}
                >
                  Configuración guardada
                  correctamente.
                </Alert>
              )}

              {agendaMutation
                .isError && (
                <Alert
                  severity="error"
                  sx={{ mb: 3 }}
                >
                  {agendaMutation
                    .error
                    ?.response
                    ?.data
                    ?.error
                    ?.message ||
                    "No fue posible guardar la configuración."}
                </Alert>
              )}

              <Stack spacing={3}>
                <TextField
                  label="Duración predeterminada de cita"
                  type="number"
                  fullWidth
                  {...register(
                    "duracion_cita_minutos",
                    {
                      valueAsNumber:
                        true,
                    }
                  )}
                  error={Boolean(
                    errors
                      .duracion_cita_minutos
                  )}
                  helperText={
                    errors
                      .duracion_cita_minutos
                      ?.message ||
                    "Duración en minutos"
                  }
                  slotProps={{
                    htmlInput: {
                      min: 5,
                      max: 240,
                      step: 5,
                    },
                  }}
                />

                <TextField
                  label="Recordatorio antes de la cita"
                  type="number"
                  fullWidth
                  {...register(
                    "horas_recordatorio",
                    {
                      valueAsNumber:
                        true,
                    }
                  )}
                  error={Boolean(
                    errors
                      .horas_recordatorio
                  )}
                  helperText={
                    errors
                      .horas_recordatorio
                      ?.message ||
                    "Cantidad de horas antes de la cita"
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 720,
                    },
                  }}
                />

                <TextField
                  select
                  label="Moneda"
                  fullWidth
                  {...register(
                    "moneda"
                  )}
                  error={Boolean(
                    errors.moneda
                  )}
                  helperText={
                    errors.moneda
                      ?.message
                  }
                >
                  <MenuItem value="GTQ">
                    GTQ - Quetzal
                  </MenuItem>

                  <MenuItem value="USD">
                    USD - Dólar
                  </MenuItem>

                  <MenuItem value="EUR">
                    EUR - Euro
                  </MenuItem>

                  <MenuItem value="MXN">
                    MXN - Peso mexicano
                  </MenuItem>
                </TextField>

                <Controller
                  name="permite_portal_paciente"
                  control={control}
                  render={({
                    field,
                  }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={
                            field.value
                          }
                          onChange={
                            field.onChange
                          }
                        />
                      }
                      label="Permitir portal del paciente"
                    />
                  )}
                />
              </Stack>

              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    agendaMutation
                      .isPending
                      ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      )
                      : <SaveIcon />
                  }
                  disabled={
                    agendaMutation
                      .isPending ||
                    !isDirty
                  }
                >
                  {agendaMutation
                    .isPending
                    ? "Guardando..."
                    : "Guardar configuración"}
                </Button>
              </Stack>
            </Box>
          )}

          {/* ========================
              APARIENCIA
          ======================== */}

          {activeTab === 2 && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
              >
                Apariencia
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Personaliza la
                apariencia de ClinicAX
                para esta clínica.
              </Typography>

              <Divider
                sx={{ my: 3 }}
              />

              {appearanceMutation
                .isSuccess && (
                <Alert
                  severity="success"
                  sx={{ mb: 3 }}
                >
                  Apariencia guardada
                  correctamente.
                </Alert>
              )}

              {appearanceMutation
                .isError && (
                <Alert
                  severity="error"
                  sx={{ mb: 3 }}
                >
                  No fue posible guardar
                  la apariencia.
                </Alert>
              )}

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "1fr 1fr",
                  },

                  gap: 4,
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                    >
                      Color principal
                    </Typography>

                    <TextField
                      type="color"
                      value={
                        branding.primary
                      }
                      onChange={(event) =>
                        setBranding(
                          (previous) => ({
                            ...previous,

                            primary:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      fullWidth
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {
                        branding.primary
                      }
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                    >
                      Color secundario
                    </Typography>

                    <TextField
                      type="color"
                      value={
                        branding.secondary
                      }
                      onChange={(event) =>
                        setBranding(
                          (previous) => ({
                            ...previous,

                            secondary:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      fullWidth
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {
                        branding.secondary
                      }
                    </Typography>
                  </Box>

                  <TextField
                    select
                    label="Modo visual"
                    value={
                      branding.mode
                    }
                    onChange={(event) =>
                      setBranding(
                        (previous) => ({
                          ...previous,

                          mode:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    fullWidth
                  >
                    <MenuItem value="light">
                      Claro
                    </MenuItem>

                    <MenuItem value="dark">
                      Oscuro
                    </MenuItem>
                  </TextField>

                  <Alert severity="info">
                    La carga del logo la
                    agregaremos en el
                    siguiente paso.
                  </Alert>

                  <Button
                    variant="contained"
                    startIcon={
                      appearanceMutation
                        .isPending
                        ? (
                          <CircularProgress
                            size={18}
                            color="inherit"
                          />
                        )
                        : (
                          <PaletteIcon />
                        )
                    }
                    disabled={
                      appearanceMutation
                        .isPending
                    }
                    onClick={() =>
                      appearanceMutation
                        .mutate()
                    }
                  >
                    {appearanceMutation
                      .isPending
                      ? "Guardando..."
                      : "Guardar apariencia"}
                  </Button>
                </Stack>

                {/* VISTA PREVIA */}

                <Box>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                  >
                    Vista previa
                  </Typography>

                  <Card
                    sx={{
                      overflow:
                        "hidden",

                      bgcolor:
                        branding.mode ===
                        "dark"
                          ? "#1e1e1e"
                          : "#ffffff",

                      color:
                        branding.mode ===
                        "dark"
                          ? "#ffffff"
                          : "#000000",
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor:
                          branding.primary,

                        color:
                          "#ffffff",

                        p: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                      >
                        {clinic?.nombre}
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        ClinicAX
                      </Typography>
                    </Box>

                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                      >
                        Vista previa
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ mb: 3 }}
                      >
                        Ejemplo de cómo
                        podrían verse los
                        elementos del
                        sistema.
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={2}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor:
                              branding.primary,

                            "&:hover": {
                              bgcolor:
                                branding.primary,
                            },
                          }}
                        >
                          Principal
                        </Button>

                        <Button
                          variant="contained"
                          sx={{
                            bgcolor:
                              branding.secondary,

                            "&:hover": {
                              bgcolor:
                                branding.secondary,
                            },
                          }}
                        >
                          Secundario
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}