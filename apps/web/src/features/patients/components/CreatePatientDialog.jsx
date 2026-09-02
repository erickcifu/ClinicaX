import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createPatient,
} from "../api/patients.api.js";

const initialForm = {
  nombres: "",
  apellidos: "",
  dpi: "",
  fecha_nacimiento: "",
  sexo: "",
  telefono: "",
  correo: "",
  direccion: "",
  ocupacion: "",
  contacto_emergencia: "",
  telefono_emergencia: "",
  observaciones: "",
};

export default function CreatePatientDialog({
  open,
  onClose,
}) {
  const queryClient =
    useQueryClient();

  const [form, setForm] =
    useState(initialForm);

  const [errorMessage, setErrorMessage] =
    useState("");

  const mutation = useMutation({
    mutationFn: createPatient,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["patients"],
      });

      setForm(initialForm);
      setErrorMessage("");

      onClose();
    },

    onError: (error) => {
      setErrorMessage(
        error
          ?.response
          ?.data
          ?.error
          ?.message ||
          "No fue posible registrar el paciente"
      );
    },
  });

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleClose() {
    if (mutation.isPending) {
      return;
    }

    setForm(initialForm);
    setErrorMessage("");

    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");

    mutation.mutate({
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),

      dpi:
        form.dpi.trim() || null,

      fecha_nacimiento:
        form.fecha_nacimiento || null,

      sexo:
        form.sexo.trim() || null,

      telefono:
        form.telefono.trim() || null,

      correo:
        form.correo.trim() || null,

      direccion:
        form.direccion.trim() || null,

      ocupacion:
        form.ocupacion.trim() || null,

      contacto_emergencia:
        form.contacto_emergencia.trim() ||
        null,

      telefono_emergencia:
        form.telefono_emergencia.trim() ||
        null,

      observaciones:
        form.observaciones.trim() || null,
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Nuevo paciente
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {errorMessage && (
              <Alert severity="error">
                {errorMessage}
              </Alert>
            )}

            <Grid
              container
              spacing={2}
            >
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="nombres"
                  label="Nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="apellidos"
                  label="Apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="dpi"
                  label="DPI"
                  value={form.dpi}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="fecha_nacimiento"
                  label="Fecha de nacimiento"
                  type="date"
                  value={
                    form.fecha_nacimiento
                  }
                  onChange={handleChange}
                  fullWidth
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
            <TextField
                name="sexo"
                label="Sexo"
                value={form.sexo}
                onChange={handleChange}
                select
                fullWidth
                >
                <MenuItem value="">
                    No especificado
                </MenuItem>

                <MenuItem value="FEMENINO">
                    Femenino
                </MenuItem>

                <MenuItem value="MASCULINO">
                    Masculino
                </MenuItem>
            </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="telefono"
                  label="Teléfono"
                  value={form.telefono}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="correo"
                  label="Correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="ocupacion"
                  label="Ocupación"
                  value={form.ocupacion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid
                size={{ xs: 12 }}
              >
                <TextField
                  name="direccion"
                  label="Dirección"
                  value={form.direccion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="contacto_emergencia"
                  label="Contacto de emergencia"
                  value={
                    form.contacto_emergencia
                  }
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  name="telefono_emergencia"
                  label="Teléfono de emergencia"
                  value={
                    form.telefono_emergencia
                  }
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid
                size={{ xs: 12 }}
              >
                <TextField
                  name="observaciones"
                  label="Observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
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
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Guardando..."
              : "Guardar paciente"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}