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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { updateClinicStatus } from "../api/clinics.api.js";

import { updateClinicStatusSchema } from "../schemas/clinic.schema.js";

export default function ClinicStatusDialog({
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
    resolver: zodResolver(
      updateClinicStatusSchema
    ),

    defaultValues: {
      estado: "ACTIVA",
    },
  });

  useEffect(() => {
    if (clinic && open) {
      reset({
        estado: clinic.estado,
      });
    }
  }, [clinic, open, reset]);

  const mutation = useMutation({
    mutationFn: ({ estado }) =>
      updateClinicStatus(
        clinic.id_clinica,
        estado
      ),

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

  const backendMessage =
    mutation.error?.response?.data?.error?.message ||
    "No fue posible cambiar el estado.";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <Box
        component="form"
        onSubmit={handleSubmit(
          (data) => mutation.mutate(data)
        )}
      >
        <DialogTitle>
          Cambiar estado
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography color="text.secondary">
              {clinic?.nombre}
            </Typography>

            {mutation.isError && (
              <Alert severity="error">
                {backendMessage}
              </Alert>
            )}

            <TextField
              select
              fullWidth
              label="Estado"
              {...register("estado")}
              error={Boolean(errors.estado)}
              helperText={errors.estado?.message}
            >
              <MenuItem value="ACTIVA">
                Activa
              </MenuItem>

              <MenuItem value="INACTIVA">
                Inactiva
              </MenuItem>

              <MenuItem value="SUSPENDIDA">
                Suspendida
              </MenuItem>
            </TextField>
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
              ? "Actualizando..."
              : "Cambiar estado"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}