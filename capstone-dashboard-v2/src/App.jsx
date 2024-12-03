import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import PrivateRoute from "./components/layout/PrivateRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import TrackJobOrder from "./pages/TrackJobOrder";
import Login from "./pages/Login";
import AccountManagement from "./pages/AccountManagement";
import ForgotPassword from "./components/login/ForgotPassword";
import ResetPassword from "./components/login/ResetPassword";
import Report from "./pages/Report";
import MyProfile from "./pages/MyProfile";
import ContentManagement from "./pages/ContentManagement";
import TestimonialForm from "./components/form/TestimonialForm";

function App() {
  const routing = useRoutes([
    {
      path: "/login-admin",
      element:
        localStorage.getItem("isLoggedIn") === "true" ? (
          <Navigate to="/" replace />
        ) : (
          <Login />
        ),
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password/:token",
      element: <ResetPassword />,
    },
    {
      path: "/feedback/:id",
      element: <TestimonialForm />,
    },
    {
      element: <PrivateRoute />,
      children: [
        {
          path: "/",
          element: <MainLayout />,
          children: [
            { path: "/", element: <Dashboard /> },
            { path: "/track-job-orders", element: <TrackJobOrder /> },
            { path: "/account-management", element: <AccountManagement /> },
            { path: "/reports", element: <Report /> },
            { path: "/my-profile", element: <MyProfile /> },
            { path: "/content-management", element: <ContentManagement /> },
          ],
        },
      ],
    },
  ]);

  return <>{routing}</>;
}

export default App;
