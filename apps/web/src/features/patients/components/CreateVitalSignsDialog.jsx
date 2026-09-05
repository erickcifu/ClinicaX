import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createVitalSigns,
} from "../api/consultations.api.js";


/*
 * =====================================================
 * FORMULARIO VACÍO
 * =====================================================
 */
const initialForm = {
  presion_sistolica: "",
  presion_diastolica: "",

  frecuencia_cardiaca: "",
  frecuencia_respiratoria: "",

  temperatura_c: "",
  pulso: "",

  cp: "",
  observaciones: "",
};


/*
 * =====================================================
 * COMPONENTE
 * =====================================================
 */
export default function CreateVitalSignsDialog({
  open,
  patientId,
  consultationId,
  onClose,
}) {
  const queryClient =
    useQueryClient();


  /*
   * Estado del formulario.
   */
  const [
    form,
    setForm,
  ] = useState({
    ...initialForm,
  });


  /*
   * Mensaje de error.
   */
  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /*
   * Convierte:
   *
   * ""     → null
   * "120"  → 120
   * "36.7" → 36.7
   */
  function optionalNumber(
    value
  ) {
    if (
      value === ""
    ) {
      return null;
    }

    return Number(value);
  }


  /*
   * ===================================================
   * POST SIGNOS VITALES
   * ===================================================
   */
  const mutation =
    useMutation({
      mutationFn: (
        payload
      ) =>
        createVitalSigns(
          patientId,
          consultationId,
          payload
        ),

      /*
       * Después de guardar:
       *
       * refrescamos el detalle de la consulta.
       */
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "consultation",
            patientId,
            consultationId,
          ],
        });

        setForm({
          ...initialForm,
        });

        setErrorMessage("");

        onClose();
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
            "No fue posible registrar los signos vitales"
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
        [name]: value,
      })
    );
  }


  /*
   * ===================================================
   * CERRAR
   * ===================================================
   */
  function handleClose() {
    if (
      mutation.isPending
    ) {
      return;
    }

    setForm({
      ...initialForm,
    });

    setErrorMessage("");

    onClose();
  }


  /*
   * ===================================================
   * GUARDAR
   * ===================================================
   */
  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErrorMessage("");

    mutation.mutate({
      presion_sistolica:
        optionalNumber(
          form.presion_sistolica
        ),

      presion_diastolica:
        optionalNumber(
          form.presion_diastolica
        ),

      frecuencia_cardiaca:
        optionalNumber(
          form.frecuencia_cardiaca
        ),

      frecuencia_respiratoria:
        optionalNumber(
          form.frecuencia_respiratoria
        ),

      temperatura_c:
        optionalNumber(
          form.temperatura_c
        ),

      pulso:
        optionalNumber(
          form.pulso
        ),

      cp:
        form.cp.trim() ||
        null,

      observaciones:
        form.observaciones.trim() ||
        null,
    });
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
      <form
        onSubmit={
          handleSubmit
        }
      >
        <DialogTitle>
          Registrar signos vitales
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Stack spacing={3}>

            {/*
             * ERROR
             */}
            {errorMessage && (
              <Alert severity="error">
                {errorMessage}
              </Alert>
            )}


            <Grid
              container
              spacing={2}
            >

              {/*
               * PRESIÓN SISTÓLICA
               */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  name="presion_sistolica"
                  label="Presión sistólica"
                  type="number"
                  value={
                    form.presion_sistolica
                  }
                  onChange={
                    handleChange
                  }
                  fullWidth
                />
              </Grid>


              {/*
               * PRESIÓN DIASTÓLICA
               */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  name="presion_diastolica"
                  label="Presión diastólica"
                  type="number"
                  value={
                    form.presion_diastolica
                  }
                  onChange={
                    handleChange
                  }
                  fullWidth
                />
              </Grid>


              {/*
               * FRECUENCIA CARDÍACA
               */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  name="frecuencia_cardiaca"
                  label="Frecuencia cardíaca"
                  type="number"
                  value={
                    form.frecuencia_cardiaca
                  }
                  onChange={
                    handleChange
                  }
                  fullWidth
                />
              </Grid>


              {/*
               * FRECUENCIA RESPIRATORIA
               */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  name="frecuencia_respiratoria"
                  label="Frecuencia respiratoria"
                  type="number"
                  value={
                    form.frecuencia_respiratoria
                  }
                  onChange={
                    handleChange
                  }
                  fullWidth
                />
              </Grid>


              {/*
               * TEMPERATURA
               */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  name="temperatura_c"
                  label="Temperatura °C"
                  type="number"
                  value={
                    form.temperatura_c
                  }
                  onChange={
                    handleChange
                  }
                  slotProps={{
                    htmlInput: {
                      step: "0.1",
                    },
                  }}
                  fullWidth
                />
              </Grid>


              {/*
               * PULSO
               */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  name="pulso"
                  label="Pulso"
                  type="number"
                  value={
                    form.pulso
                  }
                  onChange={
                    handleChange
                  }
                  fullWidth
                />
              </Grid>


              {/*
               * SATURACIÓN / CP
               */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  name="cp"
                  label="Saturación / CP"
                  placeholder="Ej. 98%"
                  value={
                    form.cp
                  }
                  onChange={
                    handleChange
                  }
                  fullWidth
                />
              </Grid>


              {/*
               * OBSERVACIONES
               */}
              <Grid
                size={{
                  xs: 12,
                }}
              >
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
                />
              </Grid>

            </Grid>

          </Stack>
        </DialogContent>


        <DialogActions>
          <Button
            onClick={
              handleClose
            }
            disabled={
              mutation.isPending
            }
          >
            Cancelar
          </Button>


          <Button
            type="submit"
            variant="contained"
            disabled={
              mutation.isPending
            }
          >
            {mutation.isPending
              ? "Guardando..."
              : "Registrar signos vitales"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}