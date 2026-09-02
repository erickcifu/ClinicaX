import { useMemo } from "react";

import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { createClinicTheme } from "../../theme/createClinicTheme.js";
import { defaultBranding } from "../../theme/branding.js";
import { AuthProvider } from "../../features/auth/context/AuthContext.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppProviders({ children }) {
  const theme = useMemo(() => {
    return createClinicTheme(defaultBranding);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
