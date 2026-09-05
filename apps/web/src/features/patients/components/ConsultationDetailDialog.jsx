import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

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
  getConsultation,
  updateConsultation,
} from "../api/consultations.api.js";

import CreateVitalSignsDialog from "./CreateVitalSignsDialog.jsx";

import OdontogramDialog from "./odontogram/OdontogramDialog.jsx";

import TreatmentRecordsPanel from "./TreatmentRecordsPanel.jsx";

/*
 * =====================================================
 * FORMULARIO DE CONSULTA
 * =====================================================
 */
const emptyForm = {
  diagnostico: "",
  observaciones: "",
};


/*
 * =====================================================
 * FORMATEAR FECHA
 * =====================================================
 *
 * Backend trabaja en UTC.
 * Frontend muestra horario de Guatemala.
 */
function formatDateTime(value) {
  if (!value) {
    return "No registrada";
  }

  return new Intl.DateTimeFormat(
    "es-GT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Guatemala",
    }
  ).format(
    new Date(value)
  );
}


/*
 * =====================================================
 * COMPONENTE PRINCIPAL
 * =====================================================
 */
export default function ConsultationDetailDialog({
  open,
  patientId,
  consultationId,
  canEdit,
  onClose,
}) {
  const queryClient =
    useQueryClient();


  /*
   * ===================================================
   * FORMULARIO DE CONSULTA
   * ===================================================
   */
  const [
    form,
    setForm,
  ] = useState({
    ...emptyForm,
  });


  /*
   * ===================================================
   * DIÁLOGO SIGNOS VITALES
   * ===================================================
   */
  const [
    vitalSignsDialogOpen,
    setVitalSignsDialogOpen,
  ] = useState(false);


  /*
   * ===================================================
   * DIÁLOGO ODONTOGRAMA
   * ===================================================
   */
  const [
    odontogramDialogOpen,
    setOdontogramDialogOpen,
  ] = useState(false);


  /*
   * ===================================================
   * MENSAJE DE ERROR
   * ===================================================
   */
  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /*
   * ===================================================
   * GET CONSULTA
   * ===================================================
   */
  const {
    data: consultation,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "consultation",
      patientId,
      consultationId,
    ],

    queryFn: () =>
      getConsultation(
        patientId,
        consultationId
      ),

    enabled:
      Boolean(
        open &&
        patientId &&
        consultationId
      ),
  });


  /*
   * ===================================================
   * PRECARGAR FORMULARIO
   * ===================================================
   */
  useEffect(() => {
    if (!consultation) {
      return;
    }

    setForm({
      diagnostico:
        consultation.diagnostico ||
        "",

      observaciones:
        consultation.observaciones ||
        "",
    });
  }, [consultation]);


  /*
   * ===================================================
   * ESTADO DE LA CONSULTA
   * ===================================================
   */
  const isFinalized =
    consultation?.estado ===
    "FINALIZADA";


  /*
   * Solamente puede modificarse cuando:
   *
   * - usuario tiene permiso
   * - consulta está abierta
   */
  const canModify =
    canEdit &&
    !isFinalized;


  /*
   * ===================================================
   * PATCH CONSULTA
   * ===================================================
   */
  const mutation =
    useMutation({
      mutationFn: (
        payload
      ) =>
        updateConsultation(
          patientId,
          consultationId,
          payload
        ),

      onSuccess:
        async () => {
          setErrorMessage("");

          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [
                "consultation",
                patientId,
                consultationId,
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "consultations",
                patientId,
              ],
            }),
          ]);
        },

      onError: (
        mutationError
      ) => {
        setErrorMessage(
          mutationError
            ?.response
            ?.data
            ?.error
            ?.message ||
          "No fue posible actualizar la consulta"
        );
      },
    });


  /*
   * ===================================================
   * CAMBIO DE CAMPOS
   * ===================================================
   */
  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );
  }


  /*
   * ===================================================
   * GUARDAR CONSULTA
   * ===================================================
   */
  function handleSave() {
    setErrorMessage("");

    mutation.mutate({
      diagnostico:
        form.diagnostico.trim() ||
        null,

      observaciones:
        form.observaciones.trim() ||
        null,
    });
  }


  /*
   * ===================================================
   * FINALIZAR CONSULTA
   * ===================================================
   */
  function handleFinalize() {
    const confirmed =
      window.confirm(
        "¿Está seguro de finalizar esta consulta? Una vez finalizada ya no podrá modificarse."
      );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    mutation.mutate(
      {
        diagnostico:
          form.diagnostico.trim() ||
          null,

        observaciones:
          form.observaciones.trim() ||
          null,

        estado:
          "FINALIZADA",
      },
      {
        onSuccess: () => {
          /*
           * Cerramos también diálogos secundarios
           * por seguridad.
           */
          setVitalSignsDialogOpen(
            false
          );

          setOdontogramDialogOpen(
            false
          );

          onClose();
        },
      }
    );
  }


  /*
   * ===================================================
   * CERRAR CONSULTA
   * ===================================================
   */
  function handleClose() {
    if (
      mutation.isPending
    ) {
      return;
    }

    setErrorMessage("");

    /*
     * Cerramos diálogos hijos si estuvieran abiertos.
     */
    setVitalSignsDialogOpen(
      false
    );

    setOdontogramDialogOpen(
      false
    );

    onClose();
  }


  /*
   * ===================================================
   * JSX
   * ===================================================
   *
   * IMPORTANTE:
   *
   * Tenemos un fragmento:
   *
   * <>
   *
   *   Dialog consulta
   *
   *   CreateVitalSignsDialog
   *
   *   OdontogramDialog
   *
   * </>
   *
   * Los tres son hermanos.
   */
  return (
    <>

      {/*
       * =================================================
       * DIÁLOGO PRINCIPAL DE LA CONSULTA
       * =================================================
       */}
      <Dialog
        open={open}
        onClose={
          handleClose
        }
        fullWidth
        maxWidth="md"
      >

        {/*
         * ===============================================
         * CABECERA
         * ===============================================
         */}
        <DialogTitle>
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
            <Typography
              variant="h6"
              fontWeight={700}
            >
              {consultationId
                ? `Consulta #${consultationId}`
                : "Consulta"}
            </Typography>


            {consultation && (
              <Chip
                label={
                  consultation.estado
                }
                color={
                  isFinalized
                    ? "success"
                    : "warning"
                }
                size="small"
              />
            )}
          </Stack>
        </DialogTitle>


        {/*
         * ===============================================
         * CONTENIDO
         * ===============================================
         */}
        <DialogContent
          dividers
        >

          {/*
           * CARGANDO
           */}
          {isLoading && (
            <Box
              sx={{
                minHeight: 300,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}


          {/*
           * ERROR DEL GET
           */}
          {isError && (
            <Alert severity="error">
              {error
                ?.response
                ?.data
                ?.error
                ?.message ||
                "No fue posible cargar la consulta"}
            </Alert>
          )}


          {/*
           * CONSULTA CARGADA
           */}
          {!isLoading &&
            !isError &&
            consultation && (

            <Stack spacing={3}>

              {/*
               * =========================================
               * CONSULTA FINALIZADA
               * =========================================
               */}
              {isFinalized && (
                <Alert severity="success">
                  Esta consulta fue finalizada.
                  La información se encuentra
                  disponible únicamente para lectura.
                </Alert>
              )}


              {/*
               * =========================================
               * ERROR DEL PATCH
               * =========================================
               */}
              {errorMessage && (
                <Alert severity="error">
                  {errorMessage}
                </Alert>
              )}


              {/*
               * =========================================
               * INFORMACIÓN GENERAL
               * =========================================
               */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    mb: 1.5,
                  }}
                >
                  Información de la consulta
                </Typography>


                <Stack spacing={1}>

                  <Typography
                    variant="body2"
                  >
                    <strong>
                      Odontólogo:
                    </strong>{" "}

                    {
                      consultation
                        .odontologo
                        ?.nombres
                    }{" "}

                    {
                      consultation
                        .odontologo
                        ?.apellidos
                    }
                  </Typography>


                  <Typography
                    variant="body2"
                  >
                    <strong>
                      Inicio:
                    </strong>{" "}

                    {formatDateTime(
                      consultation
                        .fecha_hora_inicio
                    )}
                  </Typography>


                  {consultation
                    .fecha_hora_fin && (

                    <Typography
                      variant="body2"
                    >
                      <strong>
                        Finalización:
                      </strong>{" "}

                      {formatDateTime(
                        consultation
                          .fecha_hora_fin
                      )}
                    </Typography>

                  )}

                </Stack>
              </Box>


              <Divider />


              {/*
               * =========================================
               * MOTIVO DE CONSULTA
               * =========================================
               */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Motivo de consulta
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {consultation
                    .motivo_consulta ||
                    "No registrado"}
                </Typography>
              </Box>


              {/*
               * =========================================
               * DIAGNÓSTICO
               * =========================================
               */}
              <TextField
                name="diagnostico"
                label="Diagnóstico"
                value={
                  form.diagnostico
                }
                onChange={
                  handleChange
                }
                multiline
                minRows={3}
                fullWidth
                disabled={
                  !canModify
                }
                placeholder="Ingrese el diagnóstico clínico..."
              />


              {/*
               * =========================================
               * OBSERVACIONES
               * =========================================
               */}
              <TextField
                name="observaciones"
                label="Observaciones"
                value={
                  form.observaciones
                }
                onChange={
                  handleChange
                }
                multiline
                minRows={3}
                fullWidth
                disabled={
                  !canModify
                }
                placeholder="Ingrese observaciones de la consulta..."
              />


              <Divider />


              {/*
               * =========================================
               * SIGNOS VITALES
               * =========================================
               */}
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
                    variant="subtitle1"
                    fontWeight={700}
                  >
                    Signos vitales
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Mediciones registradas
                    durante esta consulta.
                  </Typography>
                </Box>


                {canModify && (
                  <Button
                    variant="outlined"
                    startIcon={
                      <AddIcon />
                    }
                    onClick={() =>
                      setVitalSignsDialogOpen(
                        true
                      )
                    }
                    sx={{
                      textTransform:
                        "none",
                    }}
                  >
                    Registrar signos vitales
                  </Button>
                )}

              </Stack>


              {/*
               * =========================================
               * SIN SIGNOS VITALES
               * =========================================
               */}
              {(
                consultation
                  .signos_vitales
                  ?.length || 0
              ) === 0 && (

                <Alert severity="info">
                  Esta consulta todavía
                  no tiene signos vitales
                  registrados.
                </Alert>

              )}


              {/*
               * =========================================
               * LISTADO DE TOMAS
               * =========================================
               *
               * La toma más reciente aparece primero.
               */}
              {consultation
                .signos_vitales
                ?.map(
                  (
                    vital,
                    index
                  ) => (

                    <CardVitalSigns
                      key={
                        vital
                          .id_signo_vital
                      }
                      vital={
                        vital
                      }
                      number={
                        consultation
                          .signos_vitales
                          .length -
                        index
                      }
                    />

                  )
                )}


              {/*
               * =========================================
               * SEPARACIÓN ENTRE SIGNOS Y ODONTOGRAMA
               * =========================================
               */}
              <Divider />


              {/*
               * =========================================
               * ODONTOGRAMA
               * =========================================
               */}
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
                    variant="subtitle1"
                    fontWeight={700}
                  >
                    Odontograma
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Visualice y registre las
                    condiciones dentales del paciente.
                  </Typography>
                </Box>


                <Button
                variant="outlined"
                onClick={() =>
                  setOdontogramDialogOpen(
                    true
                  )
                }
                sx={{
                  textTransform:
                    "none",
                }}
              >
                Abrir odontograma
              </Button>

              </Stack>


              {/*
               * Si la consulta está finalizada,
               * todavía permitimos abrir el odontograma,
               * pero OdontogramDialog recibirá:
               *
               * canEdit = false
               *
               * y quedará solamente lectura.
               */}

            </Stack>

          )}

              {/*
               * =========================================
               * Tratamiento
               * =========================================
               */}
          <Divider />


          <TreatmentRecordsPanel
            patientId={
              patientId
            }

            consultationId={
              consultationId
            }

            canEdit={
              canModify
            }
          />
        </DialogContent>



        {/*
         * ===============================================
         * BOTONES INFERIORES
         * ===============================================
         */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >

          <Button
            onClick={
              handleClose
            }
            disabled={
              mutation.isPending
            }
          >
            Cerrar
          </Button>


          {consultation &&
            canModify && (

            <>

              <Button
                variant="outlined"
                onClick={
                  handleSave
                }
                disabled={
                  mutation.isPending
                }
              >
                {mutation.isPending
                  ? "Guardando..."
                  : "Guardar cambios"}
              </Button>


              <Button
                variant="contained"
                color="success"
                onClick={
                  handleFinalize
                }
                disabled={
                  mutation.isPending
                }
              >
                Finalizar consulta
              </Button>

            </>

          )}

        </DialogActions>

      </Dialog>


      {/*
       * =================================================
       * HERMANO #1
       *
       * DIÁLOGO DE SIGNOS VITALES
       * =================================================
       *
       * Está FUERA del Dialog principal.
       */}
      <CreateVitalSignsDialog
        open={
          vitalSignsDialogOpen
        }
        patientId={
          patientId
        }
        consultationId={
          consultationId
        }
        onClose={() =>
          setVitalSignsDialogOpen(
            false
          )
        }
      />


      {/*
       * =================================================
       * HERMANO #2
       *
       * DIÁLOGO DEL ODONTOGRAMA
       * =================================================
       *
       * También está FUERA del Dialog principal.
       *
       * Los tres elementos:
       *
       * Dialog principal
       * CreateVitalSignsDialog
       * OdontogramDialog
       *
       * están contenidos por:
       *
       * <>
       * </>
       */}
      <OdontogramDialog
        open={
          odontogramDialogOpen
        }
        patientId={
          patientId
        }
        consultationId={
          consultationId
        }
        canEdit={
          canModify
        }
        onClose={() =>
          setOdontogramDialogOpen(
            false
          )
        }
      />

    </>
  );
}



/*
 * =====================================================
 * CARD DE UNA TOMA DE SIGNOS VITALES
 * =====================================================
 */
function CardVitalSigns({
  vital,
  number,
}) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor:
          "divider",

        borderRadius: 3,

        p: {
          xs: 2,
          sm: 2.5,
        },

        bgcolor:
          "background.paper",
      }}
    >

      <Stack spacing={2}>

        {/*
         * CABECERA
         */}
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          spacing={1}
        >

          <Typography
            fontWeight={700}
          >
            Toma #{number}
          </Typography>


          <Typography
            variant="body2"
            color="text.secondary"
          >
            {formatDateTime(
              vital.fecha_toma
            )}
          </Typography>

        </Stack>


        <Divider />


        {/*
         * DATOS
         */}
        <Grid
          container
          spacing={2}
        >

          {/*
           * PRESIÓN
           */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <VitalValue
              label="Presión arterial"
              value={
                vital.presion_sistolica !==
                  null &&
                vital.presion_diastolica !==
                  null

                  ? `${vital.presion_sistolica}/${vital.presion_diastolica} mmHg`

                  : "No registrada"
              }
            />
          </Grid>


          {/*
           * FRECUENCIA CARDÍACA
           */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <VitalValue
              label="Frecuencia cardíaca"
              value={
                vital.frecuencia_cardiaca !==
                  null

                  ? `${vital.frecuencia_cardiaca} lpm`

                  : "No registrada"
              }
            />
          </Grid>


          {/*
           * FRECUENCIA RESPIRATORIA
           */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <VitalValue
              label="Frecuencia respiratoria"
              value={
                vital.frecuencia_respiratoria !==
                  null

                  ? `${vital.frecuencia_respiratoria} rpm`

                  : "No registrada"
              }
            />
          </Grid>


          {/*
           * TEMPERATURA
           */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <VitalValue
              label="Temperatura"
              value={
                vital.temperatura_c !==
                  null

                  ? `${vital.temperatura_c} °C`

                  : "No registrada"
              }
            />
          </Grid>


          {/*
           * PULSO
           */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <VitalValue
              label="Pulso"
              value={
                vital.pulso !==
                  null

                  ? `${vital.pulso} lpm`

                  : "No registrado"
              }
            />
          </Grid>


          {/*
           * SATURACIÓN / CP
           */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <VitalValue
              label="Saturación / CP"
              value={
                vital.cp ||
                "No registrada"
              }
            />
          </Grid>

        </Grid>


        {/*
         * OBSERVACIONES DE LA TOMA
         */}
        {vital.observaciones && (

          <>

            <Divider />


            <Box>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Observaciones
              </Typography>


              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                }}
              >
                {
                  vital.observaciones
                }
              </Typography>

            </Box>

          </>

        )}

      </Stack>

    </Box>
  );
}


/*
 * =====================================================
 * VALOR INDIVIDUAL DE SIGNO VITAL
 * =====================================================
 */
function VitalValue({
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
        }}
      >
        {label}
      </Typography>


      <Typography
        fontWeight={600}
      >
        {value}
      </Typography>

    </Box>
  );
}