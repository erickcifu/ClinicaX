import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createOdontogram,
  getOdontogram,
  getTeethCatalog,
} from "../../api/odontogram.api.js";

import ToothVisual, {
  ODONTOGRAM_STATUS,
} from "./ToothVisual.jsx";

import ToothConditionDialog from "./ToothConditionDialog.jsx";


/*
 * =====================================================
 * ARCADA SUPERIOR
 * =====================================================
 */
const UPPER_ARCH = [
  18,
  17,
  16,
  15,
  14,
  13,
  12,
  11,

  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
];


/*
 * =====================================================
 * ARCADA INFERIOR
 * =====================================================
 */
const LOWER_ARCH = [
  48,
  47,
  46,
  45,
  44,
  43,
  42,
  41,

  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
];


/*
 * =====================================================
 * CURVATURA DE LA ARCADA SUPERIOR
 * =====================================================
 */
const UPPER_OFFSETS = [
  34,
  26,
  19,
  12,
  7,
  3,
  0,
  0,

  0,
  0,
  3,
  7,
  12,
  19,
  26,
  34,
];


/*
 * =====================================================
 * CURVATURA DE LA ARCADA INFERIOR
 * =====================================================
 */
const LOWER_OFFSETS = [
  0,
  5,
  10,
  15,
  19,
  23,
  26,
  28,

  28,
  26,
  23,
  19,
  15,
  10,
  5,
  0,
];


/*
 * =====================================================
 * CUADRANTES PARA TELÉFONO
 * =====================================================
 *
 * En móvil no intentamos mostrar 16 dientes
 * en una sola fila.
 *
 * Dividimos en:
 *
 * - Superior derecha
 * - Superior izquierda
 * - Inferior derecha
 * - Inferior izquierda
 */
const MOBILE_QUADRANTS = [
  {
    key:
      "upper-right",

    title:
      "Superior derecha",

    teeth: [
      18,
      17,
      16,
      15,
      14,
      13,
      12,
      11,
    ],
  },

  {
    key:
      "upper-left",

    title:
      "Superior izquierda",

    teeth: [
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
    ],
  },

  {
    key:
      "lower-right",

    title:
      "Inferior derecha",

    teeth: [
      48,
      47,
      46,
      45,
      44,
      43,
      42,
      41,
    ],
  },

  {
    key:
      "lower-left",

    title:
      "Inferior izquierda",

    teeth: [
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
    ],
  },
];


/*
 * =====================================================
 * AGRUPAR DETALLES POR DIENTE
 * =====================================================
 *
 * Ejemplo:
 *
 * id_diente 30
 *
 * [
 *   OCLUSAL → CARIES,
 *   MESIAL  → RESINA
 * ]
 */
function buildDetailsMap(
  odontogram
) {
  const map =
    new Map();

  for (
    const detail of
      odontogram?.detalles ||
      []
  ) {
    const toothId =
      detail.id_diente;

    if (
      !map.has(
        toothId
      )
    ) {
      map.set(
        toothId,
        []
      );
    }

    map
      .get(toothId)
      .push(
        detail
      );
  }

  return map;
}


/*
 * =====================================================
 * COMPONENTE PRINCIPAL
 * =====================================================
 */
export default function OdontogramPanel({
  patientId,
  consultationId,
  canEdit = false,
}) {
  const queryClient =
    useQueryClient();


  /*
   * ===================================================
   * RESPONSIVE
   * ===================================================
   */
  const theme =
    useTheme();

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down(
        "sm"
      )
    );


  /*
   * ===================================================
   * DIENTE SELECCIONADO
   * ===================================================
   */
  const [
    selectedTooth,
    setSelectedTooth,
  ] =
    useState(null);


  /*
   * ===================================================
   * DIÁLOGO DE CONDICIÓN
   * ===================================================
   */
  const [
    conditionDialogOpen,
    setConditionDialogOpen,
  ] =
    useState(false);


  /*
   * ===================================================
   * CATÁLOGO DE DIENTES
   * ===================================================
   */
  const {
    data: teeth = [],

    isLoading:
      teethLoading,

    isError:
      teethError,
  } =
    useQuery({
      queryKey: [
        "teeth-catalog",
      ],

      queryFn:
        getTeethCatalog,
    });


  /*
   * ===================================================
   * ODONTOGRAMA
   * ===================================================
   */
  const {
    data:
      odontogram,

    isLoading:
      odontogramLoading,

    isError:
      odontogramError,

    error:
      odontogramQueryError,
  } =
    useQuery({
      queryKey: [
        "odontogram",
        patientId,
        consultationId,
      ],

      queryFn: () =>
        getOdontogram(
          patientId,
          consultationId
        ),

      enabled:
        Boolean(
          patientId &&
          consultationId
        ),
    });


  /*
   * ===================================================
   * CREAR ODONTOGRAMA
   * ===================================================
   */
  const createMutation =
    useMutation({
      mutationFn: () =>
        createOdontogram(
          patientId,
          consultationId,
          {
            tipo:
              "EVOLUCION",

            observaciones:
              "Odontograma de la consulta",
          }
        ),

      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "odontogram",
              patientId,
              consultationId,
            ],
          });
        },
    });


  /*
   * ===================================================
   * MAPA FDI → DIENTE
   * ===================================================
   *
   * Ej:
   *
   * 46 → objeto del diente
   */
  const teethByFdi =
    useMemo(() => {
      const map =
        new Map();

      teeth.forEach(
        (tooth) => {
          map.set(
            tooth.numero_fdi,
            tooth
          );
        }
      );

      return map;
    }, [
      teeth,
    ]);


  /*
   * ===================================================
   * DETALLES AGRUPADOS
   * ===================================================
   */
  const detailsMap =
    useMemo(
      () =>
        buildDetailsMap(
          odontogram
        ),

      [
        odontogram,
      ]
    );


  /*
   * ===================================================
   * ABRIR DIENTE
   * ===================================================
   */
  function openTooth(
    tooth
  ) {
    setSelectedTooth(
      tooth
    );

    setConditionDialogOpen(
      true
    );
  }


  /*
   * ===================================================
   * DETALLES DEL DIENTE SELECCIONADO
   * ===================================================
   */
  const selectedDetails =
    selectedTooth
      ? detailsMap.get(
          selectedTooth.id_diente
        ) || []
      : [];


  /*
   * ===================================================
   * CARGANDO
   * ===================================================
   */
  if (
    teethLoading ||
    odontogramLoading
  ) {
    return (
      <Box
        sx={{
          py: 8,

          display:
            "grid",

          placeItems:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }


  /*
   * ===================================================
   * ERROR
   * ===================================================
   */
  if (
    teethError ||
    odontogramError
  ) {
    return (
      <Alert
        severity="error"
      >
        {
          odontogramQueryError
            ?.response
            ?.data
            ?.error
            ?.message ||
          "No fue posible cargar el odontograma"
        }
      </Alert>
    );
  }


  /*
   * ===================================================
   * SIN ODONTOGRAMA
   * ===================================================
   */
  if (!odontogram) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2.5,
            sm: 4,
          },

          textAlign:
            "center",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Esta consulta todavía
            no tiene odontograma
          </Typography>


          <Typography
            color="text.secondary"
          >
            Cree el odontograma para
            comenzar a registrar las
            condiciones dentales.
          </Typography>


          {canEdit && (
            <Button
              variant="contained"

              startIcon={
                <AddIcon />
              }

              onClick={() =>
                createMutation.mutate()
              }

              disabled={
                createMutation.isPending
              }
            >
              {createMutation.isPending
                ? "Creando..."
                : "Crear odontograma"}
            </Button>
          )}

        </Stack>
      </Paper>
    );
  }


  /*
   * ===================================================
   * RENDER ARCADA ESCRITORIO
   * ===================================================
   */
  function renderArch(
    fdiNumbers,
    offsets,
    lower = false
  ) {
    return (
      <Box
        sx={{
          /*
           * Permitimos únicamente scroll horizontal
           * si la pantalla queda demasiado justa.
           *
           * No permitimos scroll vertical interno.
           */
          overflowX:
            "auto",

          overflowY:
            "hidden",

          /*
           * Más espacio vertical para evitar
           * que los dientes queden recortados.
           */
          pt: 2,

          pb: 7,

          minHeight:
            175,

          /*
           * Scroll más cómodo.
           */
          WebkitOverflowScrolling:
            "touch",
        }}
      >
        <Box
          sx={{
            minWidth:
              930,

            /*
             * Más altura disponible.
             */
            minHeight:
              135,

            display:
              "flex",

            justifyContent:
              "center",

            alignItems:
              lower
                ? "flex-start"
                : "flex-end",

            px: 2,
          }}
        >
          {fdiNumbers.map(
            (
              numeroFdi,
              index
            ) => {
              const tooth =
                teethByFdi.get(
                  numeroFdi
                );

              if (!tooth) {
                return null;
              }


              const details =
                detailsMap.get(
                  tooth.id_diente
                ) || [];


              /*
               * Índice 7:
               *
               * último diente del primer cuadrante.
               */
              const isMiddle =
                index === 7;


              return (
                <Box
                  key={
                    tooth.id_diente
                  }
                  sx={{
                    /*
                     * Separación central
                     * entre cuadrantes.
                     */
                    ml:
                      index === 8
                        ? 2.5
                        : 0,

                    mr:
                      isMiddle
                        ? 2.5
                        : 0,

                    /*
                     * Curvatura.
                     */
                    transform:
                      `translateY(${offsets[index]}px)`,

                    transition:
                      "transform 0.2s ease",
                  }}
                >
                  <ToothVisual
                    tooth={
                      tooth
                    }

                    details={
                      details
                    }

                    selected={
                      selectedTooth
                        ?.id_diente ===
                      tooth.id_diente
                    }

                    onClick={
                      openTooth
                    }
                  />
                </Box>
              );
            }
          )}
        </Box>
      </Box>
    );
  }


  /*
   * ===================================================
   * RENDER CUADRANTE MÓVIL
   * ===================================================
   *
   * Cada cuadrante tiene 8 dientes.
   *
   * Los mostramos 4 por fila:
   *
   * 18 17 16 15
   * 14 13 12 11
   */
  function renderMobileQuadrant(
    quadrant
  ) {
    return (
      <Paper
        key={
          quadrant.key
        }
        variant="outlined"
        sx={{
          p: 2,

          borderRadius:
            3,
        }}
      >
        <Typography
          align="center"
          fontWeight={700}
          sx={{
            mb: 2,
          }}
        >
          {
            quadrant.title
          }
        </Typography>


        <Box
          sx={{
            display:
              "grid",

            /*
             * Cuatro dientes por fila.
             */
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",

            columnGap:
              1,

            rowGap:
              2,

            justifyItems:
              "center",

            alignItems:
              "start",
          }}
        >
          {quadrant.teeth.map(
            (
              numeroFdi
            ) => {
              const tooth =
                teethByFdi.get(
                  numeroFdi
                );

              if (!tooth) {
                return null;
              }


              const details =
                detailsMap.get(
                  tooth.id_diente
                ) || [];


              return (
                <ToothVisual
                  key={
                    tooth.id_diente
                  }

                  tooth={
                    tooth
                  }

                  details={
                    details
                  }

                  selected={
                    selectedTooth
                      ?.id_diente ===
                    tooth.id_diente
                  }

                  onClick={
                    openTooth
                  }
                />
              );
            }
          )}
        </Box>
      </Paper>
    );
  }


  /*
   * ===================================================
   * JSX
   * ===================================================
   */
  return (
    <>

      <Stack spacing={3}>

        {/*
         * =============================================
         * CABECERA
         * =============================================
         */}
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Odontograma
          </Typography>


          <Typography
            variant="body2"
            color="text.secondary"
          >
            Seleccione un diente para
            registrar o consultar sus
            condiciones.
          </Typography>
        </Box>


        <Divider />


        {/*
         * =============================================
         * LEYENDA
         * =============================================
         */}
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
            },

            borderRadius:
              3,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              mb: 1.5,
            }}
          >
            Leyenda
          </Typography>


          <Stack
            direction="row"
            spacing={{
              xs: 1.2,
              sm: 2,
            }}
            flexWrap="wrap"
            useFlexGap
          >
            {Object.entries(
              ODONTOGRAM_STATUS
            ).map(
              ([
                key,
                config,
              ]) => (

                <Stack
                  key={key}
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width:
                        11,

                      height:
                        11,

                      borderRadius:
                        "50%",

                      bgcolor:
                        config.color,

                      flexShrink:
                        0,
                    }}
                  />


                  <Typography
                    variant="caption"
                  >
                    {
                      config.label
                    }
                  </Typography>
                </Stack>

              )
            )}
          </Stack>
        </Paper>


        {/*
         * =================================================
         * MÓVIL
         * =================================================
         *
         * Mostramos cuatro cuadrantes.
         */}
        {isMobile ? (

          <Stack spacing={2}>

            <Alert severity="info">
              En teléfono el odontograma
              se divide por cuadrantes para
              facilitar la selección de cada diente.
            </Alert>


            {MOBILE_QUADRANTS.map(
              (
                quadrant
              ) =>
                renderMobileQuadrant(
                  quadrant
                )
            )}

          </Stack>

        ) : (

          /*
           * ===============================================
           * TABLET / ESCRITORIO
           * ===============================================
           *
           * Mostramos las arcadas completas.
           */
          <>

            {/*
             * ARCADA SUPERIOR
             */}
            <Paper
              variant="outlined"
              sx={{
                p: {
                  sm: 2.5,
                  md: 3,
                },

                /*
                 * Más espacio para evitar
                 * el scroll vertical que tenías.
                 */
                minHeight:
                  245,

                overflow:
                  "hidden",

                borderRadius:
                  3,
              }}
            >
              <Typography
                align="center"
                fontWeight={700}
                sx={{
                  mb: 1,
                }}
              >
                Arcada superior
              </Typography>


              {renderArch(
                UPPER_ARCH,
                UPPER_OFFSETS
              )}
            </Paper>


            {/*
             * ARCADA INFERIOR
             */}
            <Paper
              variant="outlined"
              sx={{
                p: {
                  sm: 2.5,
                  md: 3,
                },

                minHeight:
                  245,

                overflow:
                  "hidden",

                borderRadius:
                  3,
              }}
            >
              <Typography
                align="center"
                fontWeight={700}
                sx={{
                  mb: 1,
                }}
              >
                Arcada inferior
              </Typography>


              {renderArch(
                LOWER_ARCH,
                LOWER_OFFSETS,
                true
              )}
            </Paper>

          </>

        )}


        {/*
         * =============================================
         * OBSERVACIONES
         * =============================================
         */}
        {odontogram
          .observaciones && (

          <Alert severity="info">
            <strong>
              Observaciones del odontograma:
            </strong>{" "}

            {
              odontogram
                .observaciones
            }
          </Alert>

        )}

      </Stack>


      {/*
       * =================================================
       * DIÁLOGO DE CONDICIÓN DEL DIENTE
       * =================================================
       */}
      <ToothConditionDialog
        open={
          conditionDialogOpen
        }

        patientId={
          patientId
        }

        consultationId={
          consultationId
        }

        tooth={
          selectedTooth
        }

        details={
          selectedDetails
        }

        canEdit={
          canEdit
        }

        onClose={() =>
          setConditionDialogOpen(
            false
          )
        }
      />

    </>
  );
}