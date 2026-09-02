import {
  Box,
  CircularProgress,
} from "@mui/material";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../features/auth/context/useAuth.js";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
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

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
