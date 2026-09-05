import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createConsultationTreatment,
  getTreatmentsCatalog,
  updateConsultationTreatment,
} from "../api/treatments.api.js";

import {
  getTeethCatalog,
} from "../api/odontogram.api.js";


const EMPTY_FORM = {
  treatmentId: "",
  toothId: "",
  value: "",
  description: "",
  observations: "",
};


export default function CreateTreatmentRecordDialog({
  open,
  patientId,
  consultationId,
  record = null,
  onClose,
}) {
  const queryClient =
    useQueryClient();

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /*
   * ===================================================
   * CATÁLOGO TRATAMIENTOS
   * ===================================================
   */
  const {
    data: treatments = [],
  } =
    useQuery({
      queryKey: [
        "treatments-catalog",
      ],

      queryFn:
        getTreatmentsCatalog,

      enabled:
        open,
    });


  /*
   * ===================================================
   * CATÁLOGO DIENTES
   * ===================================================
   */
  const {
    data: teeth = [],
  } =
    useQuery({
      queryKey: [
        "teeth-catalog",
      ],

      queryFn:
        getTeethCatalog,

      enabled:
        open,
    });


  /*
   * ===================================================
   * EDICIÓN / NUEVO
   * ===================================================
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setErrorMessage("");

    if (record) {
      setForm({
        treatmentId:
          record.id_tratamiento ||
          "",

        toothId:
          record.id_diente ??
          "",

        value:
          record.valor ??
          "",

        description:
          record.descripcion ||
          "",

        observations:
          record.observaciones ||
          "",
      });

      return;
    }

    setForm({
      ...EMPTY_FORM,
    });
  }, [
    open,
    record,
  ]);


  const selectedTreatment =
    useMemo(
      () =>
        treatments.find(
          (treatment) =>
            String(
              treatment.id_tratamiento
            ) ===
            String(
              form.treatmentId
            )
        ) || null,

      [
        treatments,
        form.treatmentId,
      ]
    );


  const selectedTooth =
    useMemo(
      () =>
        teeth.find(
          (tooth) =>
            String(
              tooth.id_diente
            ) ===
            String(
              form.toothId
            )
        ) || null,

      [
        teeth,
        form.toothId,
      ]
    );


  /*
   * ===================================================
   * GUARDAR
   * ===================================================
   */
  const mutation =
    useMutation({
      mutationFn:
        async () => {
          const payload = {
            id_tratamiento:
              form.treatmentId,

            id_diente:
              form.toothId === ""
                ? null
                : Number(
                    form.toothId
                  ),

            descripcion:
              form.description.trim() ||
              null,

            valor:
              Number(
                form.value ||
                0
              ),

            observaciones:
              form.observations.trim() ||
              null,
          };


          if (record) {
            return updateConsultationTreatment(
              patientId,
              consultationId,
              record.id_registro_tratamiento,
              payload
            );
          }


          return createConsultationTreatment(
            patientId,
            consultationId,
            payload
          );
        },


      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "consultation-treatments",
              patientId,
              consultationId,
            ],
          });

          setErrorMessage("");

          onClose();
        },


      onError:
        (error) => {
          setErrorMessage(
            error
              ?.response
              ?.data
              ?.error
              ?.message ||
            "No fue posible guardar el tratamiento"
          );
        },
    });


  function selectTreatment(
    treatment
  ) {
    if (!treatment) {
      setForm(
        (current) => ({
          ...current,

          treatmentId:
            "",
        })
      );

      return;
    }


    setForm(
      (current) => ({
        ...current,

        treatmentId:
          treatment.id_tratamiento,

        /*
         * Solo precargamos precio cuando
         * estamos creando un registro.
         */
        value:
          record
            ? current.value
            : treatment.precio_base,
      })
    );
  }


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


  const canSave =
    Boolean(
      form.treatmentId
    ) &&
    Number(
      form.value
    ) >= 0;


  return (
    <Dialog
      open={open}
      onClose={
        mutation.isPending
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography
          variant="h6"
          fontWeight={700}
        >
          {record
            ? "Editar tratamiento realizado"
            : "Registrar tratamiento realizado"}
        </Typography>
      </DialogTitle>


      <DialogContent
        dividers
      >
        <Stack spacing={3}>

          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}


          {/*
           * TRATAMIENTO
           */}
          <Autocomplete
            options={
              treatments
            }

            value={
              selectedTreatment
            }

            getOptionLabel={(
              option
            ) =>
              option.nombre ||
              ""
            }

            isOptionEqualToValue={(
              option,
              value
            ) =>
              String(
                option.id_tratamiento
              ) ===
              String(
                value.id_tratamiento
              )
            }

            onChange={(
              event,
              value
            ) =>
              selectTreatment(
                value
              )
            }

            renderInput={(
              params
            ) => (
              <TextField
                {...params}
                label="Tratamiento"
                required
                placeholder="Seleccione un tratamiento"
              />
            )}
          />


          {selectedTreatment && (
            <Alert severity="info">
              Precio base:{" "}
              <strong>
                Q
                {
                  Number(
                    selectedTreatment
                      .precio_base
                  ).toFixed(
                    2
                  )
                }
              </strong>

              {selectedTreatment.descripcion
                ? ` · ${selectedTreatment.descripcion}`
                : ""}
            </Alert>
          )}


          {/*
           * DIENTE
           */}
          <Autocomplete
            options={
              teeth
            }

            value={
              selectedTooth
            }

            getOptionLabel={(
              option
            ) =>
              `FDI ${option.numero_fdi} - ${option.nombre}`
            }

            isOptionEqualToValue={(
              option,
              value
            ) =>
              option.id_diente ===
              value.id_diente
            }

            onChange={(
              event,
              value
            ) =>
              setForm(
                (current) => ({
                  ...current,

                  toothId:
                    value
                      ?.id_diente ??
                    "",
                })
              )
            }

            renderInput={(
              params
            ) => (
              <TextField
                {...params}
                label="Diente"
                placeholder="Opcional"
                helperText="Déjelo vacío para tratamientos generales, como una limpieza."
              />
            )}
          />


          {/*
           * VALOR
           */}
          <TextField
            name="value"
            label="Valor"
            type="number"
            value={
              form.value
            }
            onChange={
              handleChange
            }
            fullWidth
            slotProps={{
              htmlInput: {
                min: 0,
                step: "0.01",
              },
            }}
            helperText="El precio base es sugerido; puede modificarse para este procedimiento."
          />


          {/*
           * DESCRIPCIÓN
           */}
          <TextField
            name="description"
            label="Descripción del procedimiento"
            value={
              form.description
            }
            onChange={
              handleChange
            }
            multiline
            minRows={3}
            fullWidth
            placeholder="Ej. Restauración oclusal con resina fotocurada..."
          />


          {/*
           * OBSERVACIONES
           */}
          <TextField
            name="observations"
            label="Observaciones"
            value={
              form.observations
            }
            onChange={
              handleChange
            }
            multiline
            minRows={3}
            fullWidth
            placeholder="Observaciones posteriores al procedimiento..."
          />

        </Stack>
      </DialogContent>


      <DialogActions>
        <Button
          onClick={
            onClose
          }
          disabled={
            mutation.isPending
          }
        >
          Cancelar
        </Button>


        <Button
          variant="contained"
          onClick={() =>
            mutation.mutate()
          }
          disabled={
            !canSave ||
            mutation.isPending
          }
        >
          {mutation.isPending
            ? "Guardando..."
            : record
              ? "Guardar cambios"
              : "Registrar tratamiento"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}