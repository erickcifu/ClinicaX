import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

import OdontogramPanel
  from "./OdontogramPanel.jsx";


export default function OdontogramDialog({
  open,
  patientId,
  consultationId,
  canEdit = false,
  onClose,
}) {
  return (
    <Dialog
      open={open}
      onClose={
        onClose
      }
      fullWidth
      maxWidth="xl"

      PaperProps={{
        sx: {
          minHeight:
            "85vh",

          maxHeight:
            "92vh",
        },
      }}
    >
      <DialogTitle>
        <Stack spacing={0.3}>
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
            Consulta #{consultationId}
          </Typography>
        </Stack>
      </DialogTitle>


      <DialogContent
        dividers
      >
        <OdontogramPanel
          patientId={
            patientId
          }
          consultationId={
            consultationId
          }
          canEdit={
            canEdit
          }
        />
      </DialogContent>


      <DialogActions>
        <Button
          onClick={
            onClose
          }
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}