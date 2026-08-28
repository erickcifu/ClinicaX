import { useState } from "react";

import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import {
  NavLink,
  Outlet,
} from "react-router-dom";

import { defaultBranding } from "../../theme/branding.js";

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
        {menuItems.map((item) => (
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
            sx={{ flexGrow: 1 }}
          >
            {defaultBranding.clinicName}
          </Typography>

          <Typography variant="body2">
            Administrador
          </Typography>
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