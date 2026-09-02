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
  getDentalHistory,
  updateDentalHistory,
} from "../api/dental-history.api.js";


/*
 * Formulario vacío.
 *
 * Se utiliza cuando el paciente todavía
 * no tiene historia odontológica.
 */
const emptyForm = {
  ulceras_bucales: false,
  dolor_dentario: false,
  gingivorragia: false,
  infecciones_orales: false,

  reaccion_anestesia: false,
  detalle_reaccion_anestesia: "",

  habitos: "",
  motivo_ultima_consulta_dental: "",
  historia_tratamientos_previos: "",
  observaciones: "",
};


/*
 * Convierte la respuesta del backend
 * al formato que utiliza el formulario.
 */
function historyToForm(
  history
) {
  if (!history) {
    return {
      ...emptyForm,
    };
  }

  return {
    ulceras_bucales:
      Boolean(
        history.ulceras_bucales
      ),

    dolor_dentario:
      Boolean(
        history.dolor_dentario
      ),

    gingivorragia:
      Boolean(
        history.gingivorragia
      ),

    infecciones_orales:
      Boolean(
        history.infecciones_orales
      ),

    reaccion_anestesia:
      Boolean(
        history.reaccion_anestesia
      ),

    detalle_reaccion_anestesia:
      history.detalle_reaccion_anestesia ||
      "",

    habitos:
      history.habitos || "",

    motivo_ultima_consulta_dental:
      history.motivo_ultima_consulta_dental ||
      "",

    historia_tratamientos_previos:
      history.historia_tratamientos_previos ||
      "",

    observaciones:
      history.observaciones || "",
  };
}


export default function DentalHistoryPanel({
  patientId,
  canEdit,
}) {
  /*
   * TanStack Query Client.
   * Nos permite refrescar los datos
   * después de guardar.
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
   * Error mostrado cuando falla PATCH.
   */
  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /*
   * GET:
   * /patients/:id/dental-history
   */
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "dental-history",
      patientId,
    ],

    queryFn: () =>
      getDentalHistory(
        patientId
      ),

    enabled:
      Boolean(patientId),
  });


  /*
   * Cuando llegan datos del backend,
   * llenamos el formulario.
   */
  useEffect(() => {
    if (data) {
      setForm(
        historyToForm(
          data.dental_history
        )
      );
    }
  }, [data]);


  /*
   * PATCH para guardar cambios.
   */
  const mutation =
    useMutation({
      mutationFn: (
        payload
      ) =>
        updateDentalHistory(
          patientId,
          payload
        ),

      /*
       * Si todo sale bien,
       * refrescamos automáticamente.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "dental-history",
            patientId,
          ],
        });

        setErrorMessage("");
      },

      /*
       * Si backend responde error,
       * lo mostramos.
       */
      onError: (
        mutationError
      ) => {
        setErrorMessage(
          mutationError
            ?.response
            ?.data
            ?.error
            ?.message ||
            "No fue posible guardar la historia odontológica"
        );
      },
    });


  /*
   * Maneja TextField.
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
   * Maneja Switch.
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

    mutation.mutate({
      ulceras_bucales:
        form.ulceras_bucales,

      dolor_dentario:
        form.dolor_dentario,

      gingivorragia:
        form.gingivorragia,

      infecciones_orales:
        form.infecciones_orales,

      reaccion_anestesia:
        form.reaccion_anestesia,

      /*
       * Si no existe reacción,
       * limpiamos el detalle.
       */
      detalle_reaccion_anestesia:
        form.reaccion_anestesia
          ? form.detalle_reaccion_anestesia.trim() ||
            null
          : null,

      habitos:
        form.habitos.trim() ||
        null,

      motivo_ultima_consulta_dental:
        form.motivo_ultima_consulta_dental.trim() ||
        null,

      historia_tratamientos_previos:
        form.historia_tratamientos_previos.trim() ||
        null,

      observaciones:
        form.observaciones.trim() ||
        null,
    });
  }


  /*
   * Estado mientras carga.
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
   * Error del GET.
   */
  if (isError) {
    return (
      <Alert severity="error">
        {error
          ?.response
          ?.data
          ?.error
          ?.message ||
          "No fue posible cargar la historia odontológica"}
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

          {/* ENCABEZADO */}
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Historia odontológica
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Antecedentes y condiciones
              relevantes para el tratamiento dental.
            </Typography>
          </Box>

          <Divider />


          {/* ERROR AL GUARDAR */}
          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}


          {/*
           * Reacción a anestesia es un
           * antecedente importante, así que
           * lo destacamos.
           */}
          {form.reaccion_anestesia && (
            <Alert severity="warning">
              Antecedente de reacción a anestesia:{" "}
              {form.detalle_reaccion_anestesia ||
                "Sin detalle"}
            </Alert>
          )}


          {/* DOLOR DENTARIO */}
          {form.dolor_dentario && (
            <Alert severity="info">
              El paciente reporta dolor dentario.
            </Alert>
          )}


          {/*
           * ANTECEDENTES PRINCIPALES
           */}
          <Grid
            container
            spacing={3}
          >

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    name="ulceras_bucales"
                    checked={
                      form.ulceras_bucales
                    }
                    onChange={
                      handleBooleanChange
                    }
                    disabled={!canEdit}
                  />
                }
                label="Úlceras bucales"
              />
            </Grid>


            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    name="dolor_dentario"
                    checked={
                      form.dolor_dentario
                    }
                    onChange={
                      handleBooleanChange
                    }
                    disabled={!canEdit}
                  />
                }
                label="Dolor dentario"
              />
            </Grid>


            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    name="gingivorragia"
                    checked={
                      form.gingivorragia
                    }
                    onChange={
                      handleBooleanChange
                    }
                    disabled={!canEdit}
                  />
                }
                label="Sangrado de encías / gingivorragia"
              />
            </Grid>


            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    name="infecciones_orales"
                    checked={
                      form.infecciones_orales
                    }
                    onChange={
                      handleBooleanChange
                    }
                    disabled={!canEdit}
                  />
                }
                label="Antecedentes de infecciones orales"
              />
            </Grid>


            {/*
             * REACCIÓN A ANESTESIA
             */}
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      name="reaccion_anestesia"
                      checked={
                        form.reaccion_anestesia
                      }
                      onChange={
                        handleBooleanChange
                      }
                      disabled={!canEdit}
                    />
                  }
                  label="Reacción previa a anestesia"
                />

                {form.reaccion_anestesia && (
                  <TextField
                    name="detalle_reaccion_anestesia"
                    label="Detalle de la reacción a anestesia"
                    value={
                      form.detalle_reaccion_anestesia
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

          </Grid>

          <Divider />


          {/* HÁBITOS */}
          <TextField
            name="habitos"
            label="Hábitos"
            placeholder="Ej. bruxismo nocturno, tabaquismo..."
            value={
              form.habitos
            }
            onChange={
              handleTextChange
            }
            multiline
            minRows={2}
            fullWidth
            disabled={!canEdit}
          />


          {/* ÚLTIMA CONSULTA */}
          <TextField
            name="motivo_ultima_consulta_dental"
            label="Motivo de la última consulta dental"
            value={
              form.motivo_ultima_consulta_dental
            }
            onChange={
              handleTextChange
            }
            multiline
            minRows={2}
            fullWidth
            disabled={!canEdit}
          />


          {/* TRATAMIENTOS PREVIOS */}
          <TextField
            name="historia_tratamientos_previos"
            label="Tratamientos odontológicos previos"
            value={
              form.historia_tratamientos_previos
            }
            onChange={
              handleTextChange
            }
            multiline
            minRows={3}
            fullWidth
            disabled={!canEdit}
          />


          {/* OBSERVACIONES */}
          <TextField
            name="observaciones"
            label="Observaciones odontológicas"
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


          {/* BOTÓN GUARDAR */}
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
                  : "Guardar historia odontológica"}
              </Button>
            </Stack>
          )}

        </Stack>
      </CardContent>
    </Card>
  );
}