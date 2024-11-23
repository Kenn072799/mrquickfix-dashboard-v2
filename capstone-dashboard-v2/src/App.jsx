import React, { useEffect } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
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
import Swal from "sweetalert2";

const isTokenExpired = (token) => {
  if (!token) return true; // No token means expired
  const decoded = jwtDecode(token);
  return decoded.exp * 1000 < Date.now();
};

const handleLogout = async () => {
  try {
    await axios.post(
      "/api/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );
    localStorage.removeItem("authToken");
    localStorage.setItem("isLoggedIn", "false");
    window.location.href = "/login-admin";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

const checkToken = async () => {
  const token = localStorage.getItem("authToken");
  if (!token || isTokenExpired(token)) {
    handleLogout();
    return;
  }

  try {
    const decoded = jwtDecode(token);
    decoded.userId;

    const response = await axios.get(`/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userStatus = response.data.data.adminStatus;

    if (userStatus === "inactive") {
      handleLogout();
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      Swal.fire("Error", "Account not found", "error");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userID");
      localStorage.setItem("isLoggedIn", "false");
      window.location.href = "/login-admin";
      return;
    } else {
      console.error("Error checking user status:", error);
    }
    handleLogout();
  }
};

function App() {
  useEffect(() => {
    checkToken();
  }, []);

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
