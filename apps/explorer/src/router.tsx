import { createBrowserRouter, Navigate } from "react-router-dom";

import { HomePage } from ".";
import LoggedInDashboard from "./lit-logged-page/LoggedInDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    children: [
      { index: true, element: <Navigate to="/playground" replace /> },
      { path: "playground", element: <LoggedInDashboard /> },
      { path: "pkp-permissions", element: <LoggedInDashboard /> },
      { path: "payment-management", element: <LoggedInDashboard /> },
    ],
  },
]);
