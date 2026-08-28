import { createTheme } from "@mui/material/styles";

export function createClinicTheme(branding) {
  return createTheme({
    palette: {
      mode: "light",

      primary: {
        main: branding.colors.primary,
      },

      secondary: {
        main: branding.colors.secondary,
      },

      background: {
        default: "#f5f7fa",
        paper: "#ffffff",
      },
    },

    shape: {
      borderRadius: branding.borderRadius,
    },

    typography: {
      fontFamily: [
        "Inter",
        "Roboto",
        "Arial",
        "sans-serif",
      ].join(","),

      h4: {
        fontWeight: 700,
      },

      h5: {
        fontWeight: 700,
      },

      h6: {
        fontWeight: 600,
      },
    },

    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },

        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },
  });
}