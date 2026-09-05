import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon
  from "@mui/icons-material/Add";

import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getConsultations,
} from "../api/consultations.api.js";

import CreateConsultationDialog
  from "./CreateConsultationDialog.jsx";

import ConsultationDetailDialog
  from "./ConsultationDetailDialog.jsx";


/*
 * =====================================================
 * FORMATEAR FECHA
 * =====================================================
 *
 * API almacena/devuelve UTC.
 *
 * Frontend presenta horario local.
 *
 * Por ahora:
 * America/Guatemala
 *
 * Más adelante lo tomaremos automáticamente
 * de la configuración de la clínica.
 */
function formatConsultationDate(
  value
) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-GT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit",

      timeZone:
        "America/Guatemala",
    }
  ).format(
    new Date(value)
  );
}


/*
 * =====================================================
 * COLOR SEGÚN ESTADO
 * =====================================================
 */
function consultationStatusColor(
  status
) {
  switch (status) {
    case "ABIERTA":
      return "warning";

    case "FINALIZADA":
      return "success";

    case "CANCELADA":
      return "default";

    default:
      return "default";
  }
}


/*
 * =====================================================
 * COMPONENTE PRINCIPAL
 * =====================================================
 */
export default function ConsultationsPanel({
  patientId,
  patientName,
  canCreate,
}) {
  /*
   * Controla diálogo:
   *
   * Nueva consulta.
   */
  const [
    createDialogOpen,
    setCreateDialogOpen,
  ] = useState(false);


  /*
   * ID de la consulta seleccionada.
   *
   * Ej:
   *
   * "1"
   * "2"
   *
   * null = ninguna seleccionada.
   */
  const [
    selectedConsultationId,
    setSelectedConsultationId,
  ] = useState(null);


  /*
   * ===================================================
   * GET HISTORIAL
   * ===================================================
   */
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "consultations",
      patientId,
    ],

    queryFn: () =>
      getConsultations(
        patientId
      ),

    enabled:
      Boolean(patientId),
  });


  /*
   * Mientras carga.
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
   * Error GET.
   */
  if (isError) {
    return (
      <Alert severity="error">
        {error
          ?.response
          ?.data
          ?.error
          ?.message ||
          "No fue posible cargar las consultas"}
      </Alert>
    );
  }


  /*
   * Si backend devuelve undefined,
   * utilizamos arreglo vacío.
   */
  const consultations =
    data?.consultations ||
    [];


  /*
   * Buscamos si existe actualmente
   * una consulta ABIERTA.
   */
  const openConsultation =
    consultations.find(
      (consultation) =>
        consultation.estado ===
        "ABIERTA"
    );


  /*
   * ===================================================
   * ABRIR DETALLE
   * ===================================================
   */
  function handleOpenConsultation(
    consultationId
  ) {
    setSelectedConsultationId(
      consultationId
    );
  }


  /*
   * ===================================================
   * CERRAR DETALLE
   * ===================================================
   */
  function handleCloseConsultation() {
    setSelectedConsultationId(
      null
    );
  }


  return (
    <>
      <Stack spacing={3}>

        {/*
         * =============================================
         * ENCABEZADO
         * =============================================
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
              variant="h6"
              fontWeight={700}
            >
              Consultas
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Historial de atenciones
              odontológicas del paciente.
            </Typography>
          </Box>


          {/*
           * ===========================================
           * NUEVA CONSULTA
           * ===========================================
           *
           * Solo aparece para ODONTOLOGO.
           *
           * Además, si existe una consulta abierta,
           * deshabilitamos visualmente el botón.
           *
           * IMPORTANTE:
           *
           * Esto es solamente UX.
           *
           * La verdadera protección sigue estando
           * en backend con:
           *
           * OPEN_CONSULTATION_EXISTS
           */}
          {canCreate && (
            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              onClick={() =>
                setCreateDialogOpen(
                  true
                )
              }
              disabled={
                Boolean(
                  openConsultation
                )
              }
              sx={{
                alignSelf: {
                  xs: "stretch",
                  sm: "center",
                },

                textTransform:
                  "none",

                borderRadius: 2,
              }}
            >
              Nueva consulta
            </Button>
          )}

        </Stack>


        {/*
         * =============================================
         * AVISO DE CONSULTA ABIERTA
         * =============================================
         */}
        {openConsultation && (
          <Alert severity="warning">
            El paciente tiene actualmente
            la Consulta #
            {
              openConsultation.id_consulta
            }{" "}
            abierta. Debe finalizarla
            antes de iniciar una nueva.
          </Alert>
        )}


        {/*
         * =============================================
         * SIN CONSULTAS
         * =============================================
         */}
        {consultations.length ===
          0 && (
          <Alert severity="info">
            El paciente todavía
            no tiene consultas
            registradas.
          </Alert>
        )}


        {/*
         * =============================================
         * HISTORIAL
         * =============================================
         */}
        {consultations.map(
          (consultation) => (
            <Card
              key={
                consultation.id_consulta
              }
              variant="outlined"
              sx={{
                borderRadius: 3,

                transition:
                  "box-shadow 0.15s ease",

                /*
                 * La consulta abierta recibe
                 * un poco más de presencia visual.
                 */
                boxShadow:
                  consultation.estado ===
                  "ABIERTA"
                    ? 1
                    : 0,

                "&:hover": {
                  boxShadow: 2,
                },
              }}
            >
              <CardContent>
                <Stack spacing={2}>

                  {/*
                   * ===================================
                   * FECHA + ESTADO
                   * ===================================
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
                    spacing={1}
                  >
                    <Box>
                      <Typography
                        fontWeight={700}
                      >
                        {formatConsultationDate(
                          consultation.fecha_hora_inicio
                        )}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Consulta #
                        {
                          consultation.id_consulta
                        }
                      </Typography>
                    </Box>


                    <Chip
                      label={
                        consultation.estado
                      }
                      color={
                        consultationStatusColor(
                          consultation.estado
                        )
                      }
                      size="small"
                    />

                  </Stack>


                  <Divider />


                  {/*
                   * ===================================
                   * ODONTÓLOGO
                   * ===================================
                   */}
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


                  {/*
                   * ===================================
                   * MOTIVO
                   * ===================================
                   */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Motivo de consulta
                    </Typography>

                    <Typography>
                      {consultation
                        .motivo_consulta ||
                        "No registrado"}
                    </Typography>
                  </Box>


                  {/*
                   * ===================================
                   * DIAGNÓSTICO
                   * ===================================
                   */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Diagnóstico
                    </Typography>

                    <Typography>
                      {consultation
                        .diagnostico ||
                        "Pendiente"}
                    </Typography>
                  </Box>


                  {/*
                   * ===================================
                   * FINALIZACIÓN
                   * ===================================
                   *
                   * Solo aparece cuando ya terminó.
                   */}
                  {consultation
                    .fecha_hora_fin && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Finalizada
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        {formatConsultationDate(
                          consultation
                            .fecha_hora_fin
                        )}
                      </Typography>
                    </Box>
                  )}


                  {/*
                   * ===================================
                   * BOTÓN ABRIR / VER
                   * ===================================
                   */}
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform:
                          "none",
                      }}
                      onClick={() =>
                        handleOpenConsultation(
                          consultation
                            .id_consulta
                        )
                      }
                    >
                      {consultation.estado ===
                      "ABIERTA"
                        ? "Abrir consulta"
                        : "Ver consulta"}
                    </Button>
                  </Stack>

                </Stack>
              </CardContent>
            </Card>
          )
        )}

      </Stack>


      {/*
       * =================================================
       * DIÁLOGO NUEVA CONSULTA
       * =================================================
       */}
      <CreateConsultationDialog
        open={
          createDialogOpen
        }

        patientId={
          patientId
        }

        patientName={
          patientName
        }

        onClose={() =>
          setCreateDialogOpen(
            false
          )
        }
      />


      {/*
       * =================================================
       * DETALLE DE CONSULTA
       * =================================================
       *
       * selectedConsultationId controla
       * qué consulta se abre.
       */}
      <ConsultationDetailDialog
        open={
          Boolean(
            selectedConsultationId
          )
        }

        patientId={
          patientId
        }

        consultationId={
          selectedConsultationId
        }

        /*
         * Por ahora usamos el mismo permiso:
         *
         * ODONTOLOGO → true
         * ADMIN      → false
         * ASISTENTE  → false
         *
         * Backend sigue siendo la autoridad real.
         */
        canEdit={
          canCreate
        }

        onClose={
          handleCloseConsultation
        }
      />

    </>
  );
}