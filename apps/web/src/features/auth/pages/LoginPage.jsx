import { useState } from "react";

import LoginIcon from "@mui/icons-material/Login";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/useAuth.js";

function getDestination(location) {
  const previousLocation = location.state?.from;

  if (!previousLocation?.pathname) {
    return "/";
  }

  return `${previousLocation.pathname}${previousLocation.search ?? ""}${previousLocation.hash ?? ""}`;
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    isAuthenticated,
    isLoading: isRestoringSession,
    login,
  } = useAuth();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = getDestination(location);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({
        correo,
        contrasena,
      });

      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error?.message ||
          error?.message ||
          "No fue posible iniciar sesión"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isRestoringSession) {
    return (
      <Box
        role="status"
        aria-label="Restaurando sesión"
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 3,
              sm: 4,
            },
            "&:last-child": {
              pb: {
                xs: 3,
                sm: 4,
              },
            },
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
              >
                ClinicAX
              </Typography>

              <Typography color="text.secondary">
                Inicia sesión para continuar
              </Typography>
            </Box>

            {errorMessage && (
              <Alert severity="error">
                {errorMessage}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={3}>
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={correo}
                  onChange={(event) =>
                    setCorreo(event.target.value)
                  }
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                />

                <TextField
                  label="Contraseña"
                  type="password"
                  value={contrasena}
                  onChange={(event) =>
                    setContrasena(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <LoginIcon />
                    )
                  }
                >
                  {isSubmitting
                    ? "Ingresando..."
                    : "Iniciar sesión"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
