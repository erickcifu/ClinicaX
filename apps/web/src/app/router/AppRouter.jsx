import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import AppShell from "../../components/layout/AppShell.jsx";

import DashboardPage from "../../pages/DashboardPage.jsx";

import ClinicsPage from "../../features/clinics/pages/ClinicsPage.jsx";

import ClinicSettingsPage from "../../features/clinics/pages/ClinicSettingsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,

    children: [
      {
        index: true,
        element: <DashboardPage />,
      },

      {
        path: "clinics",
        element: <ClinicsPage />,
      },

      {
        path: "clinics/:id/settings",
        element: <ClinicSettingsPage />,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}