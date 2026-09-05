import {
  Box,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";


/*
 * =====================================================
 * ESTADOS DEL ODONTOGRAMA
 * =====================================================
 *
 * Todos coinciden con PostgreSQL.
 */
export const ODONTOGRAM_STATUS = {
  SANO: {
    label: "Sano",
    color: "#43A047",
  },

  CARIES: {
    label: "Caries",
    color: "#E53935",
  },

  RESINA: {
    label: "Resina",
    color: "#1E88E5",
  },

  CORONA: {
    label: "Corona",
    color: "#8E24AA",
  },

  ENDODONCIA: {
    label: "Endodoncia",
    color: "#FB8C00",
  },

  EXTRAIDO: {
    label: "Extraído",
    color: "#757575",
  },

  IMPLANTE: {
    label: "Implante",
    color: "#00897B",
  },

  PUENTE: {
    label: "Puente",
    color: "#3949AB",
  },

  SELLANTE: {
    label: "Sellante",
    color: "#00ACC1",
  },

  FRACTURA: {
    label: "Fractura",
    color: "#6D4C41",
  },

  OTRO: {
    label: "Otro",
    color: "#546E7A",
  },
};


/*
 * =====================================================
 * TIPO DE DIENTE
 * =====================================================
 */
function getToothType(
  numeroFdi
) {
  const position =
    Number(
      String(
        numeroFdi
      ).slice(-1)
    );

  if (
    position === 1 ||
    position === 2
  ) {
    return "INCISOR";
  }

  if (
    position === 3
  ) {
    return "CANINE";
  }

  if (
    position === 4 ||
    position === 5
  ) {
    return "PREMOLAR";
  }

  return "MOLAR";
}


/*
 * =====================================================
 * CUADRANTE FDI
 * =====================================================
 *
 * 1 → superior derecho
 * 2 → superior izquierdo
 * 3 → inferior izquierdo
 * 4 → inferior derecho
 */
function getQuadrant(
  numeroFdi
) {
  return Math.floor(
    Number(numeroFdi) /
      10
  );
}


/*
 * =====================================================
 * CONFIGURACIÓN DEL DIENTE
 * =====================================================
 */
function getToothInfo(
  numeroFdi
) {
  const type =
    getToothType(
      numeroFdi
    );

  const quadrant =
    getQuadrant(
      numeroFdi
    );

  const anterior =
    type === "INCISOR" ||
    type === "CANINE";

  const upper =
    quadrant === 1 ||
    quadrant === 2;

  /*
   * Mesial siempre mira hacia
   * la línea media.
   *
   * En cuadrantes 1 y 4:
   * mesial queda visualmente a la derecha.
   *
   * En cuadrantes 2 y 3:
   * mesial queda visualmente a la izquierda.
   */
  const mesialOnRight =
    quadrant === 1 ||
    quadrant === 4;

  return {
    type,
    quadrant,
    anterior,
    upper,
    mesialOnRight,
  };
}


/*
 * =====================================================
 * BUSCAR DETALLE DE SUPERFICIE
 * =====================================================
 */
function findSurfaceDetail(
  details,
  surface
) {
  return (
    details.find(
      (detail) =>
        detail.superficie ===
        surface
    ) || null
  );
}


/*
 * =====================================================
 * OBTENER COLOR DE DETALLE
 * =====================================================
 */
function getDetailColor(
  detail
) {
  if (!detail) {
    return null;
  }

  return (
    ODONTOGRAM_STATUS[
      detail.estado
    ]?.color ||
    "#78909C"
  );
}


/*
 * =====================================================
 * SILUETA BASE
 * =====================================================
 */
function BaseToothShape({
  type,
  fill,
  stroke,
}) {
  if (
    type ===
    "INCISOR"
  ) {
    return (
      <path
        d="
          M18 8
          Q30 3 42 8
          Q47 18 44 31
          Q42 46 38 67
          Q36 76 30 76
          Q24 76 22 67
          Q18 46 16 31
          Q13 18 18 8
          Z
        "
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
    );
  }


  if (
    type ===
    "CANINE"
  ) {
    return (
      <path
        d="
          M17 13
          Q23 4 30 3
          Q37 4 43 13
          Q47 22 43 34
          Q40 48 36 69
          Q34 77 30 77
          Q26 77 24 69
          Q20 48 17 34
          Q13 22 17 13
          Z
        "
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
    );
  }


  if (
    type ===
    "PREMOLAR"
  ) {
    return (
      <>
        <path
          d="
            M13 14
            Q17 5 25 7
            Q30 2 35 7
            Q44 5 47 14
            Q50 25 45 37
            Q42 48 38 68
            Q36 76 31 76
            Q26 76 23 68
            Q19 48 15 37
            Q10 25 13 14
            Z
          "
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />

        <path
          d="
            M22 22
            Q30 16
            38 22
          "
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
        />
      </>
    );
  }


  return (
    <>
      <path
        d="
          M8 16
          Q12 5 22 8
          Q27 2 32 8
          Q37 2 42 8
          Q53 5 56 16
          Q59 27 52 39
          Q48 48 44 67
          Q42 76 36 76
          Q32 76 30 69
          Q27 76 22 76
          Q16 76 14 67
          Q11 48 7 39
          Q4 27 8 16
          Z
        "
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />

      <path
        d="
          M19 23
          Q25 17
          31 23
          Q37 17
          44 23
        "
        fill="none"
        stroke={stroke}
        strokeWidth="1.2"
      />
    </>
  );
}


/*
 * =====================================================
 * MARCAS DE SUPERFICIES
 * =====================================================
 *
 * IMPORTANTE:
 *
 * Ya NO dibujamos un segundo cuadrado
 * debajo del diente.
 *
 * Las condiciones aparecen directamente
 * SOBRE el mismo diente.
 */
function SurfaceMarks({
  details,
  anterior,
  upper,
  mesialOnRight,
}) {
  const mesial =
    findSurfaceDetail(
      details,
      "MESIAL"
    );

  const distal =
    findSurfaceDetail(
      details,
      "DISTAL"
    );

  const vestibular =
    findSurfaceDetail(
      details,
      "VESTIBULAR"
    );

  const inner =
    findSurfaceDetail(
      details,
      upper
        ? "PALATINO"
        : "LINGUAL"
    ) ||
    findSurfaceDetail(
      details,
      upper
        ? "LINGUAL"
        : "PALATINO"
    );

  const center =
    findSurfaceDetail(
      details,
      anterior
        ? "INCISAL"
        : "OCLUSAL"
    );

  const root =
    findSurfaceDetail(
      details,
      "RAIZ"
    );


  const mesialColor =
    getDetailColor(
      mesial
    );

  const distalColor =
    getDetailColor(
      distal
    );

  const vestibularColor =
    getDetailColor(
      vestibular
    );

  const innerColor =
    getDetailColor(
      inner
    );

  const centerColor =
    getDetailColor(
      center
    );

  const rootColor =
    getDetailColor(
      root
    );


  /*
   * Lado izquierdo / derecho
   * cambia según cuadrante.
   */
  const leftColor =
    mesialOnRight
      ? distalColor
      : mesialColor;

  const rightColor =
    mesialOnRight
      ? mesialColor
      : distalColor;


  return (
    <>

      {/*
       * VESTIBULAR
       */}
      {vestibularColor && (
        <path
          d="
            M20 12
            Q30 7 40 12
            L37 19
            Q30 16 23 19
            Z
          "
          fill={
            vestibularColor
          }
          opacity="0.95"
        />
      )}


      {/*
       * MESIAL / DISTAL
       * lado izquierdo
       */}
      {leftColor && (
        <path
          d="
            M15 17
            Q18 13 22 13
            L22 35
            Q18 38 16 34
            Z
          "
          fill={
            leftColor
          }
          opacity="0.95"
        />
      )}


      {/*
       * MESIAL / DISTAL
       * lado derecho
       */}
      {rightColor && (
        <path
          d="
            M38 13
            Q42 13 45 17
            L44 34
            Q42 38 38 35
            Z
          "
          fill={
            rightColor
          }
          opacity="0.95"
        />
      )}


      {/*
       * OCLUSAL / INCISAL
       */}
      {centerColor && (
        anterior
          ? (
              <rect
                x="23"
                y="9"
                width="14"
                height="8"
                rx="3"
                fill={
                  centerColor
                }
              />
            )
          : (
              <ellipse
                cx="30"
                cy="24"
                rx="10"
                ry="7"
                fill={
                  centerColor
                }
              />
            )
      )}


      {/*
       * LINGUAL / PALATINO
       */}
      {innerColor && (
        <path
          d="
            M22 31
            Q30 35 38 31
            L36 39
            Q30 43 24 39
            Z
          "
          fill={
            innerColor
          }
          opacity="0.95"
        />
      )}


      {/*
       * RAÍZ
       */}
      {rootColor && (
        <path
          d="
            M24 47
            Q30 44 36 47
            L34 66
            Q32 72 30 72
            Q28 72 26 66
            Z
          "
          fill={
            rootColor
          }
          opacity="0.95"
        />
      )}

    </>
  );
}


/*
 * =====================================================
 * DIENTE SVG COMPLETO
 * =====================================================
 */
function ToothSvg({
  tooth,
  details,
  selected,
}) {
  const {
    type,
    anterior,
    upper,
    mesialOnRight,
  } =
    getToothInfo(
      tooth.numero_fdi
    );


  /*
   * Estado COMPLETO.
   */
  const completeDetail =
    findSurfaceDetail(
      details,
      "COMPLETO"
    );


  const completeColor =
    getDetailColor(
      completeDetail
    );


  const fill =
    completeColor ||
    "#FFFFFF";


  const stroke =
    selected
      ? "#1565C0"
      : "#455A64";


  const extracted =
    completeDetail
      ?.estado ===
    "EXTRAIDO";


  return (
    <svg
      viewBox="0 0 60 80"
      width="54"
      height="68"
    >

      {/*
       * SILUETA DEL DIENTE
       */}
      <BaseToothShape
        type={
          type
        }
        fill={
          fill
        }
        stroke={
          stroke
        }
      />


      {/*
       * SUPERFICIES.
       *
       * Las mostramos incluso si existe
       * COMPLETO, porque puede existir
       * información adicional.
       */}
      <SurfaceMarks
        details={
          details
        }
        anterior={
          anterior
        }
        upper={
          upper
        }
        mesialOnRight={
          mesialOnRight
        }
      />


      {/*
       * DIENTE EXTRAÍDO
       */}
      {extracted && (
        <>
          <line
            x1="13"
            y1="13"
            x2="47"
            y2="68"
            stroke="#212121"
            strokeWidth="4"
          />

          <line
            x1="47"
            y1="13"
            x2="13"
            y2="68"
            stroke="#212121"
            strokeWidth="4"
          />
        </>
      )}

    </svg>
  );
}


/*
 * =====================================================
 * COMPONENTE PRINCIPAL
 * =====================================================
 */
export default function ToothVisual({
  tooth,
  details = [],
  selected = false,
  onClick,
}) {
  const tooltipText =
    details.length === 0
      ? `${tooth.numero_fdi} - ${tooth.nombre}`
      : [
          `${tooth.numero_fdi} - ${tooth.nombre}`,

          ...details.map(
            (detail) =>
              `${detail.superficie}: ${
                ODONTOGRAM_STATUS[
                  detail.estado
                ]?.label ||
                detail.estado
              }`
          ),
        ].join("\n");


  return (
    <Tooltip
      title={
        <Box
          sx={{
            whiteSpace:
              "pre-line",
          }}
        >
          {
            tooltipText
          }
        </Box>
      }
      arrow
    >
      <Box
        component="button"
        type="button"

        onClick={() =>
          onClick?.(
            tooth
          )
        }

        sx={{
          border: 0,

          background:
            "transparent",

          cursor:
            "pointer",

          p: 0.5,

          borderRadius:
            2,

          transition:
            "transform 0.15s ease, background 0.15s ease",

          "&:hover": {
            transform:
              "translateY(-4px) scale(1.05)",

            bgcolor:
              "action.hover",
          },

          ...(selected && {
            bgcolor:
              "action.selected",
          }),
        }}
      >

        <Stack
          alignItems="center"
          spacing={0.25}
        >

          <Typography
            variant="caption"
            fontWeight={700}
          >
            {
              tooth.numero_fdi
            }
          </Typography>


          <ToothSvg
            tooth={
              tooth
            }

            details={
              details
            }

            selected={
              selected
            }
          />


          {/*
           * Pequeños indicadores.
           *
           * Sirven especialmente si existe
           * más de una condición.
           */}
          {details.length >
            1 && (

            <Stack
              direction="row"
              spacing={0.3}
              justifyContent="center"
              sx={{
                minHeight:
                  7,
              }}
            >
              {details
                .slice(
                  0,
                  5
                )
                .map(
                  (
                    detail
                  ) => (

                    <Box
                      key={
                        detail
                          .id_odontograma_detalle
                      }

                      sx={{
                        width:
                          6,

                        height:
                          6,

                        borderRadius:
                          "50%",

                        bgcolor:
                          ODONTOGRAM_STATUS[
                            detail.estado
                          ]?.color ||
                          "#78909C",
                      }}
                    />

                  )
                )}
            </Stack>

          )}

        </Stack>

      </Box>
    </Tooltip>
  );
}