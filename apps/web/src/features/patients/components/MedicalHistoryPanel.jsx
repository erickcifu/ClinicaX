import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMedicalHistory,
  updateMedicalHistory,
} from "../api/medical-history.api.js";


/*
 * Estado vacío del formulario.
 * Se utiliza cuando el paciente todavía
 * no tiene historia médica registrada.
 */
const emptyForm = {
  motivo_consulta: "",

  hospitalizado_ultimos_2_anios: false,
  detalle_hospitalizacion: "",

  tratamiento_medico_ultimos_2_anios: false,
  detalle_tratamiento_medico: "",

  alergia_medicamentos: false,
  detalle_alergias: "",

  hemorragias: false,
  detalle_hemorragias: "",

  medicacion_actual: false,
  detalle_medicacion_actual: "",

  embarazo: false,
  semanas_embarazo: "",

  consume_drogas: false,
  detalle_drogas: "",

  medico_cabecera: "",
  telefono_medico: "",

  observaciones: "",
};


/*
 * Convierte lo que viene de la API
 * al formato utilizado por el formulario.
 *
 * Esto evita valores undefined/null
 * dentro de los TextField y Switch.
 */
function historyToForm(history) {
  if (!history) {
    return {
      ...emptyForm,
    };
  }

  return {
    motivo_consulta:
      history.motivo_consulta || "",

    hospitalizado_ultimos_2_anios:
      Boolean(
        history.hospitalizado_ultimos_2_anios
      ),

    detalle_hospitalizacion:
      history.detalle_hospitalizacion || "",

    tratamiento_medico_ultimos_2_anios:
      Boolean(
        history.tratamiento_medico_ultimos_2_anios
      ),

    detalle_tratamiento_medico:
      history.detalle_tratamiento_medico || "",

    alergia_medicamentos:
      Boolean(
        history.alergia_medicamentos
      ),

    detalle_alergias:
      history.detalle_alergias || "",

    hemorragias:
      Boolean(
        history.hemorragias
      ),

    detalle_hemorragias:
      history.detalle_hemorragias || "",

    medicacion_actual:
      Boolean(
        history.medicacion_actual
      ),

    detalle_medicacion_actual:
      history.detalle_medicacion_actual || "",

    embarazo:
      Boolean(
        history.embarazo
      ),

    semanas_embarazo:
      history.semanas_embarazo ?? "",

    consume_drogas:
      Boolean(
        history.consume_drogas
      ),

    detalle_drogas:
      history.detalle_drogas || "",

    medico_cabecera:
      history.medico_cabecera || "",

    telefono_medico:
      history.telefono_medico || "",

    observaciones:
      history.observaciones || "",
  };
}


export default function MedicalHistoryPanel({
  patientId,
  patientSex,
  canEdit,
}) {

  /*
   * Normalizamos el sexo recibido desde PatientDetailPage.
   *
   * Ejemplos:
   *
   * "FEMENINO" → FEMENINO
   * "femenino" → FEMENINO
   * " Femenino " → FEMENINO
   */
  const normalizedPatientSex =
    String(patientSex || "")
      .trim()
      .toUpperCase();


  /*
   * Esta variable controla si mostramos
   * la sección de embarazo.
   *
   * Mario → MASCULINO → false
   * Ana   → FEMENINO  → true
   */
  const showPregnancySection =
    normalizedPatientSex === "FEMENINO";


  /*
   * TanStack Query client.
   * Nos permitirá refrescar los datos después
   * de guardar sin tener que usar F5.
   */
  const queryClient =
    useQueryClient();


  /*
   * Estado local del formulario.
   */
  const [
    form,
    setForm,
  ] = useState({
    ...emptyForm,
  });


  /*
   * Mensaje de error del PATCH.
   */
  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /*
   * GET
   *
   * /api/v1/patients/:id/medical-history
   *
   * Obtiene la historia médica del paciente.
   */
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "medical-history",
      patientId,
    ],

    queryFn: () =>
      getMedicalHistory(
        patientId
      ),

    enabled:
      Boolean(patientId),
  });


  /*
   * Cuando llegan los datos de backend,
   * los pasamos al formulario.
   */
  useEffect(() => {
    if (data) {
      setForm(
        historyToForm(
          data.medical_history
        )
      );
    }
  }, [data]);


  /*
   * PATCH
   *
   * Guarda o actualiza la historia médica.
   */
  const mutation =
    useMutation({
      mutationFn: (payload) =>
        updateMedicalHistory(
          patientId,
          payload
        ),

      /*
       * Si guardó correctamente:
       *
       * invalidamos la consulta para que
       * TanStack Query vuelva a solicitar
       * los datos actualizados al backend.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "medical-history",
            patientId,
          ],
        });

        setErrorMessage("");
      },

      /*
       * Si backend responde error,
       * mostramos el mensaje.
       */
      onError: (mutationError) => {
        setErrorMessage(
          mutationError
            ?.response
            ?.data
            ?.error
            ?.message ||
            "No fue posible guardar la historia médica"
        );
      },
    });


  /*
   * Maneja TextField.
   *
   * Ej:
   * motivo_consulta
   * detalle_alergias
   * medico_cabecera
   */
  function handleTextChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }


  /*
   * Maneja los Switch.
   *
   * Ej:
   * alergia_medicamentos
   * hemorragias
   * embarazo
   */
  function handleBooleanChange(
    event
  ) {
    const {
      name,
      checked,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: checked,
      })
    );
  }


  /*
   * Envía el formulario al backend.
   */
  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErrorMessage("");


    /*
     * Construimos los datos que enviaremos.
     *
     * Importante:
     * si una opción es FALSE,
     * enviamos null en su detalle relacionado.
     *
     * Ejemplo:
     *
     * alergia_medicamentos = false
     * detalle_alergias = null
     */
    mutation.mutate({
      motivo_consulta:
        form.motivo_consulta.trim() ||
        null,

      hospitalizado_ultimos_2_anios:
        form.hospitalizado_ultimos_2_anios,

      detalle_hospitalizacion:
        form.hospitalizado_ultimos_2_anios
          ? form.detalle_hospitalizacion.trim() ||
            null
          : null,

      tratamiento_medico_ultimos_2_anios:
        form.tratamiento_medico_ultimos_2_anios,

      detalle_tratamiento_medico:
        form.tratamiento_medico_ultimos_2_anios
          ? form.detalle_tratamiento_medico.trim() ||
            null
          : null,

      alergia_medicamentos:
        form.alergia_medicamentos,

      detalle_alergias:
        form.alergia_medicamentos
          ? form.detalle_alergias.trim() ||
            null
          : null,

      hemorragias:
        form.hemorragias,

      detalle_hemorragias:
        form.hemorragias
          ? form.detalle_hemorragias.trim() ||
            null
          : null,

      medicacion_actual:
        form.medicacion_actual,

      detalle_medicacion_actual:
        form.medicacion_actual
          ? form.detalle_medicacion_actual.trim() ||
            null
          : null,

      /*
       * Si el paciente NO es femenino,
       * forzamos embarazo false.
       *
       * Esto evita guardar datos inconsistentes.
       */
      embarazo:
        showPregnancySection
          ? form.embarazo
          : false,

      semanas_embarazo:
        showPregnancySection &&
        form.embarazo &&
        form.semanas_embarazo !== ""
          ? Number(
              form.semanas_embarazo
            )
          : null,

      consume_drogas:
        form.consume_drogas,

      detalle_drogas:
        form.consume_drogas
          ? form.detalle_drogas.trim() ||
            null
          : null,

      medico_cabecera:
        form.medico_cabecera.trim() ||
        null,

      telefono_medico:
        form.telefono_medico.trim() ||
        null,

      observaciones:
        form.observaciones.trim() ||
        null,
    });
  }


  /*
   * Mientras carga la historia médica.
   */
  if (isLoading) {
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


  /*
   * Si el GET falla.
   */
  if (isError) {
    return (
      <Alert severity="error">
        {error
          ?.response
          ?.data
          ?.error
          ?.message ||
          "No fue posible cargar la historia médica"}
      </Alert>
    );
  }


  return (
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
        }}
      >
        <Stack
          component="form"
          onSubmit={
            handleSubmit
          }
          spacing={3}
        >

          {/*
           * ENCABEZADO
           */}
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Historia médica
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Antecedentes relevantes
              para la atención odontológica.
            </Typography>
          </Box>

          <Divider />


          {/*
           * ERROR DE GUARDADO
           */}
          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}


          {/*
           * ALERTA IMPORTANTE:
           * ALERGIA
           */}
          {form.alergia_medicamentos && (
            <Alert severity="warning">
              Alergia a medicamentos
              registrada:{" "}
              {form.detalle_alergias ||
                "Sin detalle"}
            </Alert>
          )}


          {/*
           * ALERTA IMPORTANTE:
           * MEDICACIÓN
           */}
          {form.medicacion_actual && (
            <Alert severity="info">
              Medicación actual:{" "}
              {form.detalle_medicacion_actual ||
                "Sin detalle"}
            </Alert>
          )}


          {/*
           * MOTIVO DE CONSULTA
           */}
          <TextField
            name="motivo_consulta"
            label="Motivo de consulta"
            value={
              form.motivo_consulta
            }
            onChange={
              handleTextChange
            }
            multiline
            minRows={2}
            fullWidth
            disabled={!canEdit}
          />


          {/*
           * ANTECEDENTES MÉDICOS
           */}
          <Grid
            container
            spacing={3}
          >

            {/* HOSPITALIZACIÓN */}
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      name="hospitalizado_ultimos_2_anios"
                      checked={
                        form.hospitalizado_ultimos_2_anios
                      }
                      onChange={
                        handleBooleanChange
                      }
                      disabled={
                        !canEdit
                      }
                    />
                  }
                  label="Hospitalizado en los últimos 2 años"
                />

                {form.hospitalizado_ultimos_2_anios && (
                  <TextField
                    name="detalle_hospitalizacion"
                    label="Detalle de hospitalización"
                    value={
                      form.detalle_hospitalizacion
                    }
                    onChange={
                      handleTextChange
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    disabled={!canEdit}
                  />
                )}
              </Stack>
            </Grid>


            {/* TRATAMIENTO MÉDICO */}
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      name="tratamiento_medico_ultimos_2_anios"
                      checked={
                        form.tratamiento_medico_ultimos_2_anios
                      }
                      onChange={
                        handleBooleanChange
                      }
                      disabled={!canEdit}
                    />
                  }
                  label="Tratamiento médico en los últimos 2 años"
                />

                {form.tratamiento_medico_ultimos_2_anios && (
                  <TextField
                    name="detalle_tratamiento_medico"
                    label="Detalle del tratamiento"
                    value={
                      form.detalle_tratamiento_medico
                    }
                    onChange={
                      handleTextChange
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    disabled={!canEdit}
                  />
                )}
              </Stack>
            </Grid>


            {/* ALERGIAS */}
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      name="alergia_medicamentos"
                      checked={
                        form.alergia_medicamentos
                      }
                      onChange={
                        handleBooleanChange
                      }
                      disabled={!canEdit}
                    />
                  }
                  label="Alergia a medicamentos"
                />

                {form.alergia_medicamentos && (
                  <TextField
                    name="detalle_alergias"
                    label="Detalle de alergias"
                    value={
                      form.detalle_alergias
                    }
                    onChange={
                      handleTextChange
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    disabled={!canEdit}
                  />
                )}
              </Stack>
            </Grid>


            {/* HEMORRAGIAS */}
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      name="hemorragias"
                      checked={
                        form.hemorragias
                      }
                      onChange={
                        handleBooleanChange
                      }
                      disabled={!canEdit}
                    />
                  }
                  label="Antecedentes de hemorragias"
                />

                {form.hemorragias && (
                  <TextField
                    name="detalle_hemorragias"
                    label="Detalle de hemorragias"
                    value={
                      form.detalle_hemorragias
                    }
                    onChange={
                      handleTextChange
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    disabled={!canEdit}
                  />
                )}
              </Stack>
            </Grid>


            {/* MEDICACIÓN ACTUAL */}
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      name="medicacion_actual"
                      checked={
                        form.medicacion_actual
                      }
                      onChange={
                        handleBooleanChange
                      }
                      disabled={!canEdit}
                    />
                  }
                  label="Toma medicamentos actualmente"
                />

                {form.medicacion_actual && (
                  <TextField
                    name="detalle_medicacion_actual"
                    label="Medicamentos actuales"
                    value={
                      form.detalle_medicacion_actual
                    }
                    onChange={
                      handleTextChange
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    disabled={!canEdit}
                  />
                )}
              </Stack>
            </Grid>


            {/* CONSUMO DE DROGAS */}
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      name="consume_drogas"
                      checked={
                        form.consume_drogas
                      }
                      onChange={
                        handleBooleanChange
                      }
                      disabled={!canEdit}
                    />
                  }
                  label="Consumo de drogas"
                />

                {form.consume_drogas && (
                  <TextField
                    name="detalle_drogas"
                    label="Detalle"
                    value={
                      form.detalle_drogas
                    }
                    onChange={
                      handleTextChange
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    disabled={!canEdit}
                  />
                )}
              </Stack>
            </Grid>


            {/*
             * EMBARAZO
             *
             * SOLO se muestra si el paciente
             * tiene sexo FEMENINO.
             */}
            {showPregnancySection && (
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Stack spacing={1.5}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="embarazo"
                        checked={
                          form.embarazo
                        }
                        onChange={
                          handleBooleanChange
                        }
                        disabled={!canEdit}
                      />
                    }
                    label="Embarazo"
                  />

                  {form.embarazo && (
                    <TextField
                      name="semanas_embarazo"
                      label="Semanas de embarazo"
                      type="number"
                      value={
                        form.semanas_embarazo
                      }
                      onChange={
                        handleTextChange
                      }
                      slotProps={{
                        htmlInput: {
                          min: 0,
                          max: 45,
                        },
                      }}
                      fullWidth
                      disabled={!canEdit}
                    />
                  )}
                </Stack>
              </Grid>
            )}

          </Grid>


          <Divider />


          {/*
           * MÉDICO DE CABECERA
           */}
          <Typography
            variant="subtitle1"
            fontWeight={700}
          >
            Médico de cabecera
          </Typography>

          <Grid
            container
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                name="medico_cabecera"
                label="Nombre del médico"
                value={
                  form.medico_cabecera
                }
                onChange={
                  handleTextChange
                }
                fullWidth
                disabled={!canEdit}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                name="telefono_medico"
                label="Teléfono del médico"
                value={
                  form.telefono_medico
                }
                onChange={
                  handleTextChange
                }
                fullWidth
                disabled={!canEdit}
              />
            </Grid>
          </Grid>


          {/*
           * OBSERVACIONES GENERALES
           */}
          <TextField
            name="observaciones"
            label="Observaciones médicas"
            value={
              form.observaciones
            }
            onChange={
              handleTextChange
            }
            multiline
            minRows={3}
            fullWidth
            disabled={!canEdit}
          />


          {/*
           * BOTÓN GUARDAR
           *
           * Solo aparece si el rol puede editar.
           */}
          {canEdit && (
            <Stack
              direction="row"
              justifyContent="flex-end"
            >
              <Button
                type="submit"
                variant="contained"
                disabled={
                  mutation.isPending
                }
              >
                {mutation.isPending
                  ? "Guardando..."
                  : "Guardar historia médica"}
              </Button>
            </Stack>
          )}

        </Stack>
      </CardContent>
    </Card>
  );
}