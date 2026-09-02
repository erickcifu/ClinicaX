import { useState } from "react";

import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

import {
  NavLink,
  Outlet,
} from "react-router-dom";

import { defaultBranding } from "../../theme/branding.js";
import { useAuth } from "../../features/auth/context/useAuth.js";

const drawerWidth = 250;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/",
  },
  {
    text: "Clínicas",
    icon: <BusinessIcon />,
    path: "/clinics",
    allowedRoles: ["SUPERADMIN"],
  },
  {
    text: "Configuración",
    icon: <SettingsIcon />,
    path: "/settings",
    allowedRoles: ["ADMIN"],
  },
  {
    text: "Pacientes",
    icon: <PeopleIcon />,
    path: "/patients",
  },
  {
    text: "Agenda",
    icon: <CalendarMonthIcon />,
    path: "/appointments",
  },
];

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();

  const userRoleCodes =
    user?.roles?.map(
      (role) => role.codigo
    ) ?? [];

  const visibleMenuItems = menuItems.filter(
    (item) =>
      !item.allowedRoles ||
      item.allowedRoles.some((role) =>
        userRoleCodes.includes(role)
      )
  );

  const fullName = [
    user?.nombres,
    user?.apellidos,
  ]
    .filter(Boolean)
    .join(" ");

  const roleNames =
    user?.roles
      ?.map((role) => role.nombre)
      .join(", ") || "Usuario";

  const drawer = (
    <Box>
      <Toolbar>
        <Box>
          <Typography
            variant="h6"
            color="primary"
            fontWeight={800}
          >
            {defaultBranding.appName}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Gestión odontológica
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ px: 1 }}>
        {visibleMenuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 0.5,

              "&.active": {
                bgcolor: "primary.main",
                color: "primary.contrastText",

                "& .MuiListItemIcon-root": {
                  color: "inherit",
                },
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) =>
            theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() =>
              setMobileOpen((previous) => !previous)
            }
            sx={{
              mr: 2,
              display: {
                md: "none",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            {user?.clinica?.nombre ||
              defaultBranding.clinicName}
          </Typography>

          <Stack
            spacing={0}
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },
              textAlign: "right",
              ml: 2,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
            >
              {fullName || user?.correo}
            </Typography>

            <Typography
              variant="caption"
              sx={{ opacity: 0.85 }}
              noWrap
            >
              {roleNames}
            </Typography>
          </Stack>

          <Button
            color="inherit"
            onClick={logout}
            startIcon={<LogoutIcon />}
            aria-label="Cerrar sesión"
            sx={{
              ml: 1,
              minWidth: {
                xs: 40,
                sm: "auto",
              },
              px: {
                xs: 1,
                sm: 2,
              },
              "& .MuiButton-startIcon": {
                mr: {
                  xs: 0,
                  sm: 1,
                },
              },
            }}
          >
            <Box
              component="span"
              sx={{
                display: {
                  xs: "none",
                  sm: "inline",
                },
              }}
            >
              Cerrar sesión
            </Box>
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: {
            md: drawerWidth,
          },

          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,

          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },

          p: {
            xs: 2,
            md: 3,
          },

          mt: 8,

          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}