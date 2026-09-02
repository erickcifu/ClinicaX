import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import AppShell from "../../components/layout/AppShell.jsx";
import ProtectedRoute from "../../components/auth/ProtectedRoute.jsx";
import RoleRoute from "../../components/auth/RoleRoute.jsx";

import DashboardPage from "../../pages/DashboardPage.jsx";
import ClinicsPage from "../../features/clinics/pages/ClinicsPage.jsx";
import ClinicSettingsPage from "../../features/clinics/pages/ClinicSettingsPage.jsx";
import LoginPage from "../../features/auth/pages/LoginPage.jsx";
import PatientsPage from "../../features/patients/pages/PatientsPage.jsx";
import PatientDetailPage from "../../features/patients/pages/PatientDetailPage.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <DashboardPage />,
      },

      {
        path: "clinics",
        element: (
          <RoleRoute allowedRoles={["SUPERADMIN"]}>
            <ClinicsPage />
          </RoleRoute>
        ),
      },

      {
        path: "patients",
        element: (
          <RoleRoute
            allowedRoles={[
              "ADMIN",
              "RECEPCION",
              "ODONTOLOGO",
              "ASISTENTE",
            ]}
          >
            <PatientsPage />
          </RoleRoute>
        ),
      },
      {
      path: "patients/:id",
        element: (
          <RoleRoute
            allowedRoles={[
              "ADMIN",
              "RECEPCION",
              "ODONTOLOGO",
              "ASISTENTE",
            ]}
          >
            <PatientDetailPage />
          </RoleRoute>
        ),
      },

      {
        path: "clinics/:id/settings",
        element: (
          <RoleRoute allowedRoles={["SUPERADMIN"]}>
            <ClinicSettingsPage />
          </RoleRoute>
        ),
      },

      {
        path: "settings",
        element: (
          <RoleRoute allowedRoles={["ADMIN"]}>
            <ClinicSettingsPage isOwnClinic />
          </RoleRoute>
        ),
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}