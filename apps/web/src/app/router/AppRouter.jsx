import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import AppShell from "../../components/layout/AppShell.jsx";

import DashboardPage from "../../pages/DashboardPage.jsx";

import ClinicsPage from "../../features/clinics/pages/ClinicsPage.jsx";

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
    ],
  },
]);

export default function AppRouter() {
  return (
    <RouterProvider router={router} />
  );
}