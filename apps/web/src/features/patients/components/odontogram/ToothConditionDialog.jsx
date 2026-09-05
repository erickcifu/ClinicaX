import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createOdontogramDetail,
  updateOdontogramDetail,
} from "../../api/odontogram.api.js";

import {
  ODONTOGRAM_STATUS,
} from "./ToothVisual.jsx";


/*
 * =====================================================
 * ESTADOS
 * =====================================================
 */
const STATUS_OPTIONS =
  Object.entries(
    ODONTOGRAM_STATUS
  ).map(
    ([
      value,
      config,
    ]) => ({
      value,

      label:
        config.label,

      color:
        config.color,
    })
  );


/*
 * =====================================================
 * DATOS DEL DIENTE
 * =====================================================
 */
function getToothInfo(
  numeroFdi
) {
  const number =
    Number(
      numeroFdi
    );

  const quadrant =
    Math.floor(
      number /
        10
    );

  const position =
    Number(
      String(
        number
      ).slice(-1)
    );

  const anterior =
    position === 1 ||
    position === 2 ||
    position === 3;

  const upper =
    quadrant === 1 ||
    quadrant === 2;

  const mesialOnRight =
    quadrant === 1 ||
    quadrant === 4;


  return {
    quadrant,
    position,
    anterior,
    upper,
    mesialOnRight,
  };
}


/*
 * =====================================================
 * LABEL SUPERFICIE
 * =====================================================
 */
function getSurfaceLabel(
  surface
) {
  const labels = {
    COMPLETO:
      "Diente completo",

    MESIAL:
      "Mesial",

    DISTAL:
      "Distal",

    VESTIBULAR:
      "Vestibular",

    LINGUAL:
      "Lingual",

    PALATINO:
      "Palatino",

    OCLUSAL:
      "Oclusal",

    INCISAL:
      "Incisal",

    RAIZ:
      "Raíz",
  };

  return (
    labels[surface] ||
    surface
  );
}


/*
 * =====================================================
 * MAPA DE SUPERFICIES
 * =====================================================
 */
function SurfaceSelector({
  tooth,
  selectedSurface,
  details,
  disabled,
  onSelect,
}) {
  const {
    anterior,
    upper,
    mesialOnRight,
  } =
    getToothInfo(
      tooth.numero_fdi
    );


  const centerSurface =
    anterior
      ? "INCISAL"
      : "OCLUSAL";


  const internalSurface =
    upper
      ? "PALATINO"
      : "LINGUAL";


  /*
   * Colores existentes.
   */
  function surfaceColor(
    surface
  ) {
    const detail =
      details.find(
        (item) =>
          item.superficie ===
          surface
      );

    if (!detail) {
      return "#FFFFFF";
    }

    return (
      ODONTOGRAM_STATUS[
        detail.estado
      ]?.color ||
      "#90A4AE"
    );
  }


  function strokeFor(
    surface
  ) {
    return (
      selectedSurface ===
      surface
        ? "#1565C0"
        : "#607D8B"
    );
  }


  function strokeWidthFor(
    surface
  ) {
    return (
      selectedSurface ===
      surface
        ? 4
        : 2
    );
  }


  /*
   * Según el cuadrante:
   *
   * izquierda/derecha visual no siempre
   * significa mesial/distal.
   */
  const leftSurface =
    mesialOnRight
      ? "DISTAL"
      : "MESIAL";


  const rightSurface =
    mesialOnRight
      ? "MESIAL"
      : "DISTAL";


  return (
    <Box>

      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{
          mb: 1,
        }}
      >
        Seleccione una superficie
      </Typography>


      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
        }}
      >
        Puede hacer clic directamente
        sobre el esquema.
      </Typography>


      <Box
        sx={{
          display:
            "flex",

          justifyContent:
            "center",
        }}
      >
        <svg
          viewBox="0 0 260 280"

          style={{
            width:
              "100%",

            maxWidth:
              "330px",
          }}
        >

          {/*
           * TEXTO VESTIBULAR
           */}
          <text
            x="130"
            y="20"
            textAnchor="middle"
            fontSize="13"
            fill="#546E7A"
          >
            VESTIBULAR
          </text>


          {/*
           * VESTIBULAR
           */}
          <polygon
            points="
              70,45
              190,45
              165,90
              95,90
            "

            fill={
              surfaceColor(
                "VESTIBULAR"
              )
            }

            stroke={
              strokeFor(
                "VESTIBULAR"
              )
            }

            strokeWidth={
              strokeWidthFor(
                "VESTIBULAR"
              )
            }

            style={{
              cursor:
                disabled
                  ? "default"
                  : "pointer",
            }}

            onClick={() => {
              if (
                !disabled
              ) {
                onSelect(
                  "VESTIBULAR"
                );
              }
            }}
          />


          {/*
           * LADO IZQUIERDO
           */}
          <polygon
            points="
              45,60
              95,90
              95,170
              45,200
            "

            fill={
              surfaceColor(
                leftSurface
              )
            }

            stroke={
              strokeFor(
                leftSurface
              )
            }

            strokeWidth={
              strokeWidthFor(
                leftSurface
              )
            }

            style={{
              cursor:
                disabled
                  ? "default"
                  : "pointer",
            }}

            onClick={() => {
              if (
                !disabled
              ) {
                onSelect(
                  leftSurface
                );
              }
            }}
          />


          {/*
           * LADO DERECHO
           */}
          <polygon
            points="
              215,60
              165,90
              165,170
              215,200
            "

            fill={
              surfaceColor(
                rightSurface
              )
            }

            stroke={
              strokeFor(
                rightSurface
              )
            }

            strokeWidth={
              strokeWidthFor(
                rightSurface
              )
            }

            style={{
              cursor:
                disabled
                  ? "default"
                  : "pointer",
            }}

            onClick={() => {
              if (
                !disabled
              ) {
                onSelect(
                  rightSurface
                );
              }
            }}
          />


          {/*
           * CENTRO
           */}
          <rect
            x="95"
            y="90"
            width="70"
            height="80"
            rx="12"

            fill={
              surfaceColor(
                centerSurface
              )
            }

            stroke={
              strokeFor(
                centerSurface
              )
            }

            strokeWidth={
              strokeWidthFor(
                centerSurface
              )
            }

            style={{
              cursor:
                disabled
                  ? "default"
                  : "pointer",
            }}

            onClick={() => {
              if (
                !disabled
              ) {
                onSelect(
                  centerSurface
                );
              }
            }}
          />


          {/*
           * SUPERFICIE INTERNA
           */}
          <polygon
            points="
              70,215
              190,215
              165,170
              95,170
            "

            fill={
              surfaceColor(
                internalSurface
              )
            }

            stroke={
              strokeFor(
                internalSurface
              )
            }

            strokeWidth={
              strokeWidthFor(
                internalSurface
              )
            }

            style={{
              cursor:
                disabled
                  ? "default"
                  : "pointer",
            }}

            onClick={() => {
              if (
                !disabled
              ) {
                onSelect(
                  internalSurface
                );
              }
            }}
          />


          {/*
           * ETIQUETA IZQUIERDA
           */}
          <text
            x="20"
            y="135"
            textAnchor="middle"
            fontSize="12"
            fill="#546E7A"
          >
            {
              leftSurface
            }
          </text>


          {/*
           * ETIQUETA DERECHA
           */}
          <text
            x="240"
            y="135"
            textAnchor="middle"
            fontSize="12"
            fill="#546E7A"
          >
            {
              rightSurface
            }
          </text>


          {/*
           * CENTRO
           */}
          <text
            x="130"
            y="135"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#37474F"
          >
            {
              centerSurface
            }
          </text>


          {/*
           * INTERNO
           */}
          <text
            x="130"
            y="245"
            textAnchor="middle"
            fontSize="13"
            fill="#546E7A"
          >
            {
              internalSurface
            }
          </text>

        </svg>
      </Box>


      {/*
       * RAÍZ Y COMPLETO
       */}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1}
        justifyContent="center"
        sx={{
          mt: 1,
        }}
      >

        <Button
          variant={
            selectedSurface ===
            "RAIZ"
              ? "contained"
              : "outlined"
          }

          onClick={() =>
            onSelect(
              "RAIZ"
            )
          }

          disabled={
            disabled
          }
        >
          Raíz
        </Button>


        <Button
          variant={
            selectedSurface ===
            "COMPLETO"
              ? "contained"
              : "outlined"
          }

          onClick={() =>
            onSelect(
              "COMPLETO"
            )
          }

          disabled={
            disabled
          }
        >
          Diente completo
        </Button>

      </Stack>

    </Box>
  );
}


/*
 * =====================================================
 * COMPONENTE PRINCIPAL
 * =====================================================
 */
export default function ToothConditionDialog({
  open,
  patientId,
  consultationId,
  tooth,
  details = [],
  canEdit = false,
  onClose,
}) {
  const queryClient =
    useQueryClient();


  const [
    superficie,
    setSuperficie,
  ] =
    useState("COMPLETO");


  const [
    estado,
    setEstado,
  ] =
    useState("SANO");


  const [
    observaciones,
    setObservaciones,
  ] =
    useState("");


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");


  /*
   * ===================================================
   * SUPERFICIES DISPONIBLES
   * ===================================================
   */
  const surfaceOptions =
    useMemo(() => {
      if (!tooth) {
        return [];
      }

      const {
        anterior,
        upper,
      } =
        getToothInfo(
          tooth.numero_fdi
        );


      return [
        "COMPLETO",
        "MESIAL",
        "DISTAL",
        "VESTIBULAR",

        upper
          ? "PALATINO"
          : "LINGUAL",

        anterior
          ? "INCISAL"
          : "OCLUSAL",

        "RAIZ",
      ];
    }, [
      tooth,
    ]);


  /*
   * ===================================================
   * DETALLE EXISTENTE
   * ===================================================
   */
  const existingDetail =
    useMemo(
      () =>
        details.find(
          (detail) =>
            detail.superficie ===
            superficie
        ) || null,

      [
        details,
        superficie,
      ]
    );


  /*
   * ===================================================
   * CARGAR INFORMACIÓN EXISTENTE
   * ===================================================
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (
      existingDetail
    ) {
      setEstado(
        existingDetail.estado
      );

      setObservaciones(
        existingDetail.observaciones ||
        ""
      );
    } else {
      setEstado(
        "SANO"
      );

      setObservaciones(
        ""
      );
    }
  }, [
    open,
    existingDetail,
  ]);


  /*
   * ===================================================
   * AL ABRIR UN DIENTE
   * ===================================================
   *
   * Si ya tiene condiciones:
   * seleccionamos la primera.
   *
   * Si no:
   * COMPLETO.
   */
  useEffect(() => {
    if (
      !open ||
      !tooth
    ) {
      return;
    }

    if (
      details.length >
      0
    ) {
      setSuperficie(
        details[0]
          .superficie
      );
    } else {
      setSuperficie(
        "COMPLETO"
      );
    }

    setErrorMessage(
      ""
    );
  }, [
    open,
    tooth?.id_diente,
  ]);


  /*
   * ===================================================
   * GUARDAR
   * ===================================================
   */
  const saveMutation =
    useMutation({
      mutationFn:
        async () => {
          const payload = {
            estado,

            observaciones:
              observaciones.trim() ||
              null,
          };


          /*
           * PATCH si ya existe.
           */
          if (
            existingDetail
          ) {
            return updateOdontogramDetail(
              patientId,
              consultationId,
              existingDetail
                .id_odontograma_detalle,
              payload
            );
          }


          /*
           * POST si no existe.
           */
          return createOdontogramDetail(
            patientId,
            consultationId,
            {
              id_diente:
                tooth.id_diente,

              superficie,

              ...payload,
            }
          );
        },


      onSuccess:
        async () => {
          setErrorMessage("");

          await queryClient.invalidateQueries({
            queryKey: [
              "odontogram",
              patientId,
              consultationId,
            ],
          });
        },


      onError: (
        error
      ) => {
        setErrorMessage(
          error
            ?.response
            ?.data
            ?.error
            ?.message ||
            "No fue posible guardar la condición del diente"
        );
      },
    });


  /*
   * ===================================================
   * CERRAR
   * ===================================================
   */
  function handleClose() {
    if (
      saveMutation.isPending
    ) {
      return;
    }

    setErrorMessage("");

    onClose();
  }


  if (!tooth) {
    return null;
  }


  return (
    <Dialog
      open={open}
      onClose={
        handleClose
      }
      fullWidth
      maxWidth="md"
    >

      <DialogTitle>
        <Stack spacing={0.5}>

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Diente FDI {
              tooth.numero_fdi
            }
          </Typography>


          <Typography
            variant="body2"
            color="text.secondary"
          >
            {
              tooth.nombre
            }
          </Typography>

        </Stack>
      </DialogTitle>


      <DialogContent
        dividers
      >

        <Stack spacing={3}>

          {errorMessage && (
            <Alert severity="error">
              {
                errorMessage
              }
            </Alert>
          )}


          {/*
           * ===========================================
           * CONDICIONES EXISTENTES
           * ===========================================
           */}
          {details.length >
            0 && (

            <Box>

              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                  mb: 1,
                }}
              >
                Condiciones registradas
              </Typography>


              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
              >
                {details.map(
                  (
                    detail
                  ) => {
                    const config =
                      ODONTOGRAM_STATUS[
                        detail.estado
                      ];

                    return (
                      <Chip
                        key={
                          detail
                            .id_odontograma_detalle
                        }

                        label={
                          `${
                            getSurfaceLabel(
                              detail.superficie
                            )
                          } · ${
                            config?.label ||
                            detail.estado
                          }`
                        }

                        onClick={() =>
                          setSuperficie(
                            detail.superficie
                          )
                        }

                        sx={{
                          cursor:
                            "pointer",

                          borderLeft:
                            `6px solid ${
                              config?.color ||
                              "#78909C"
                            }`,
                        }}
                      />
                    );
                  }
                )}
              </Stack>

            </Box>

          )}


          {details.length >
            0 && (
            <Divider />
          )}


          {/*
           * ===========================================
           * MAPA VISUAL DE SUPERFICIES
           * ===========================================
           */}
          <SurfaceSelector
            tooth={
              tooth
            }

            selectedSurface={
              superficie
            }

            details={
              details
            }

            disabled={
              !canEdit
            }

            onSelect={
              setSuperficie
            }
          />


          <Divider />


          {/*
           * ===========================================
           * SELECT SUPERFICIE
           *
           * Lo mantenemos además del SVG.
           *
           * Esto ayuda:
           *
           * - accesibilidad
           * - teclado
           * - claridad
           * ===========================================
           */}
          <FormControl
            fullWidth
          >
            <InputLabel>
              Superficie
            </InputLabel>

            <Select
              label="Superficie"

              value={
                superficie
              }

              onChange={(
                event
              ) =>
                setSuperficie(
                  event.target.value
                )
              }

              disabled={
                !canEdit
              }
            >
              {surfaceOptions.map(
                (
                  surface
                ) => (
                  <MenuItem
                    key={
                      surface
                    }

                    value={
                      surface
                    }
                  >
                    {
                      getSurfaceLabel(
                        surface
                      )
                    }
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>


          {/*
           * ===========================================
           * ESTADO
           * ===========================================
           */}
          <FormControl
            fullWidth
          >
            <InputLabel>
              Estado
            </InputLabel>

            <Select
              label="Estado"

              value={
                estado
              }

              onChange={(
                event
              ) =>
                setEstado(
                  event.target.value
                )
              }

              disabled={
                !canEdit
              }
            >
              {STATUS_OPTIONS.map(
                (
                  option
                ) => (

                  <MenuItem
                    key={
                      option.value
                    }

                    value={
                      option.value
                    }
                  >

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >

                      <Box
                        sx={{
                          width:
                            13,

                          height:
                            13,

                          borderRadius:
                            "50%",

                          bgcolor:
                            option.color,
                        }}
                      />


                      <span>
                        {
                          option.label
                        }
                      </span>

                    </Stack>

                  </MenuItem>

                )
              )}
            </Select>
          </FormControl>


          {/*
           * ===========================================
           * OBSERVACIONES
           * ===========================================
           */}
          <TextField
            label="Observaciones"

            multiline

            minRows={3}

            value={
              observaciones
            }

            onChange={(
              event
            ) =>
              setObservaciones(
                event.target.value
              )
            }

            disabled={
              !canEdit
            }

            fullWidth
          />


          {/*
           * ===========================================
           * DETALLE EXISTENTE
           * ===========================================
           */}
          {existingDetail && (
            <Alert severity="info">
              Ya existe información
              registrada para{" "}

              <strong>
                {
                  getSurfaceLabel(
                    superficie
                  )
                }
              </strong>.

              {" "}
              Al guardar se actualizará
              ese registro.
            </Alert>
          )}

        </Stack>

      </DialogContent>


      <DialogActions>

        <Button
          onClick={
            handleClose
          }

          disabled={
            saveMutation.isPending
          }
        >
          Cerrar
        </Button>


        {canEdit && (
          <Button
            variant="contained"

            onClick={() =>
              saveMutation.mutate()
            }

            disabled={
              saveMutation.isPending
            }
          >
            {saveMutation.isPending
              ? "Guardando..."
              : existingDetail
                ? "Actualizar condición"
                : "Registrar condición"}
          </Button>
        )}

      </DialogActions>

    </Dialog>
  );
}