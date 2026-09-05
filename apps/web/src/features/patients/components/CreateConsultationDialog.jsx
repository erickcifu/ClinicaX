import {
  Alert,
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
  useState,
} from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createConsultation,
} from "../api/consultations.api.js";


const initialForm = {
  motivo_consulta: "",
  observaciones: "",
};


export default function CreateConsultationDialog({
  open,
  patientId,
  patientName,
  onClose,
  onCreated,
}) {
  const queryClient =
    useQueryClient();

  const [
    form,
    setForm,
  ] = useState({
    ...initialForm,
  });

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /*
   * POST para crear consulta.
   */
  const mutation =
    useMutation({
      mutationFn: (data) =>
        createConsultation(
          patientId,
          data
        ),

      /*
       * Después de crear:
       *
       * 1. actualizamos historial;
       * 2. limpiamos formulario;
       * 3. cerramos diálogo;
       * 4. opcionalmente avisamos al padre.
       */
      onSuccess: async (
        consultation
      ) => {
        await queryClient.invalidateQueries({
          queryKey: [
            "consultations",
            patientId,
          ],
        });

        setForm({
          ...initialForm,
        });

        setErrorMessage("");

        onClose();

        if (onCreated) {
          onCreated(
            consultation
          );
        }
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
            "No fue posible crear la consulta"
        );
      },
    });


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


  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErrorMessage("");

    mutation.mutate({
      motivo_consulta:
        form.motivo_consulta.trim(),

      observaciones:
        form.observaciones.trim() ||
        null,
    });
  }


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <form
        onSubmit={
          handleSubmit
        }
      >
        <DialogTitle>
          Nueva consulta
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Stack spacing={3}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Paciente:{" "}
              <strong>
                {patientName}
              </strong>
            </Typography>

            {errorMessage && (
              <Alert severity="error">
                {errorMessage}
              </Alert>
            )}

            <TextField
              name="motivo_consulta"
              label="Motivo de consulta"
              value={
                form.motivo_consulta
              }
              onChange={
                handleChange
              }
              multiline
              minRows={3}
              required
              fullWidth
              autoFocus
            />

            <TextField
              name="observaciones"
              label="Observaciones iniciales"
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
              ? "Creando..."
              : "Abrir consulta"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}