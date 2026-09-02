import { useEffect } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { updateClinic } from "../api/clinics.api.js";
import { updateClinicSchema } from "../schemas/clinic.schema.js";

export default function EditClinicDialog({
  open,
  clinic,
  onClose,
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm({
    resolver: zodResolver(updateClinicSchema),

    defaultValues: {
      nombre: "",
      nit: "",
      direccion: "",
      telefono: "",
      correo: "",
    },
  });

  useEffect(() => {
    if (clinic && open) {
      reset({
        nombre: clinic.nombre || "",
        nit: clinic.nit || "",
        direccion: clinic.direccion || "",
        telefono: clinic.telefono || "",
        correo: clinic.correo || "",
      });
    }
  }, [clinic, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      updateClinic(clinic.id_clinica, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clinics"],
      });

      onClose();
    },
  });

  function handleClose() {
    if (mutation.isPending) {
      return;
    }

    mutation.reset();
    onClose();
  }

  function onSubmit(data) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== ""
      )
    );

    mutation.mutate(cleanData);
  }

  const backendMessage =
    mutation.error?.response?.data?.error?.message ||
    "No fue posible actualizar la clínica.";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <DialogTitle>
          Editar clínica
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >
            {mutation.isError && (
              <Alert severity="error">
                {backendMessage}
              </Alert>
            )}

            <TextField
              label="Nombre de la clínica"
              fullWidth
              required
              autoFocus
              {...register("nombre")}
              error={Boolean(errors.nombre)}
              helperText={errors.nombre?.message}
            />

            <TextField
              label="NIT"
              fullWidth
              {...register("nit")}
              error={Boolean(errors.nit)}
              helperText={errors.nit?.message}
            />

            <TextField
              label="Dirección"
              fullWidth
              multiline
              minRows={2}
              {...register("direccion")}
              error={Boolean(errors.direccion)}
              helperText={errors.direccion?.message}
            />

            <TextField
              label="Teléfono"
              type="tel"
              fullWidth
              {...register("telefono")}
              error={Boolean(errors.telefono)}
              helperText={errors.telefono?.message}
            />

            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              {...register("correo")}
              error={Boolean(errors.correo)}
              helperText={errors.correo?.message}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
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
            startIcon={
              mutation.isPending
                ? <CircularProgress size={18} />
                : undefined
            }
          >
            {mutation.isPending
              ? "Guardando..."
              : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}