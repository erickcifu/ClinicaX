import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getConsultationTreatments,
} from "../api/treatments.api.js";

import CreateTreatmentRecordDialog from "./CreateTreatmentRecordDialog.jsx";


function formatDateTime(
  value
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "es-GT",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      timeZone:
        "America/Guatemala",
    }
  ).format(
    new Date(
      value
    )
  );
}


function formatMoney(
  value
) {
  return new Intl.NumberFormat(
    "es-GT",
    {
      style:
        "currency",

      currency:
        "GTQ",
    }
  ).format(
    Number(
      value ||
      0
    )
  );
}


export default function TreatmentRecordsPanel({
  patientId,
  consultationId,
  canEdit = false,
}) {
  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false);

  const [
    editingRecord,
    setEditingRecord,
  ] =
    useState(null);


  const {
    data: records = [],
    isLoading,
    isError,
    error,
  } =
    useQuery({
      queryKey: [
        "consultation-treatments",
        patientId,
        consultationId,
      ],

      queryFn: () =>
        getConsultationTreatments(
          patientId,
          consultationId
        ),

      enabled:
        Boolean(
          patientId &&
          consultationId
        ),
    });


  function openCreate() {
    setEditingRecord(
      null
    );

    setDialogOpen(
      true
    );
  }


  function openEdit(
    record
  ) {
    setEditingRecord(
      record
    );

    setDialogOpen(
      true
    );
  }


  if (isLoading) {
    return (
      <Box
        sx={{
          py: 3,
          display:
            "grid",
          placeItems:
            "center",
        }}
      >
        <CircularProgress
          size={28}
        />
      </Box>
    );
  }


  if (isError) {
    return (
      <Alert severity="error">
        {error
          ?.response
          ?.data
          ?.error
          ?.message ||
          "No fue posible cargar los tratamientos"}
      </Alert>
    );
  }


  return (
    <>

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
              Tratamientos realizados
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Procedimientos realizados
              durante esta consulta.
            </Typography>
          </Box>


          {canEdit && (
            <Button
              variant="outlined"
              startIcon={
                <AddIcon />
              }
              onClick={
                openCreate
              }
              sx={{
                textTransform:
                  "none",
              }}
            >
              Registrar tratamiento
            </Button>
          )}

        </Stack>


        {/*
         * SIN REGISTROS
         */}
        {records.length ===
          0 && (
          <Alert severity="info">
            Esta consulta todavía
            no tiene tratamientos
            realizados registrados.
          </Alert>
        )}


        {/*
         * REGISTROS
         */}
        {records.map(
          (record) => (

            <Paper
              key={
                record
                  .id_registro_tratamiento
              }
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
              }}
            >

              <Stack spacing={2}>

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
                      {
                        record
                          .tratamientos
                          ?.nombre ||
                        "Tratamiento"
                      }
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDateTime(
                        record.fecha
                      )}
                    </Typography>
                  </Box>


                  <Typography
                    fontWeight={700}
                    color="primary"
                  >
                    {formatMoney(
                      record.valor
                    )}
                  </Typography>
                </Stack>


                <Divider />


                {record.diente && (
                  <Typography
                    variant="body2"
                  >
                    <strong>
                      Diente:
                    </strong>{" "}
                    FDI{" "}
                    {
                      record
                        .diente
                        .numero_fdi
                    }{" "}
                    -{" "}
                    {
                      record
                        .diente
                        .nombre
                    }
                  </Typography>
                )}


                <Typography
                  variant="body2"
                >
                  <strong>
                    Realizado por:
                  </strong>{" "}
                  {
                    record
                      .realizado_por
                      ?.nombres
                  }{" "}
                  {
                    record
                      .realizado_por
                      ?.apellidos
                  }
                </Typography>


                {record.descripcion && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Descripción
                    </Typography>

                    <Typography
                      variant="body2"
                    >
                      {
                        record.descripcion
                      }
                    </Typography>
                  </Box>
                )}


                {record.observaciones && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Observaciones
                    </Typography>

                    <Typography
                      variant="body2"
                    >
                      {
                        record
                          .observaciones
                      }
                    </Typography>
                  </Box>
                )}


                {canEdit && (
                  <Box>
                    <Button
                      size="small"
                      onClick={() =>
                        openEdit(
                          record
                        )
                      }
                      sx={{
                        textTransform:
                          "none",
                      }}
                    >
                      Editar
                    </Button>
                  </Box>
                )}

              </Stack>
            </Paper>

          )
        )}

      </Stack>


      <CreateTreatmentRecordDialog
        open={
          dialogOpen
        }

        patientId={
          patientId
        }

        consultationId={
          consultationId
        }

        record={
          editingRecord
        }

        onClose={() => {
          setDialogOpen(
            false
          );

          setEditingRecord(
            null
          );
        }}
      />

    </>
  );
}