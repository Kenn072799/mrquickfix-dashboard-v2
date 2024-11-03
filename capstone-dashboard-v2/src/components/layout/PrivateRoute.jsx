import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isTokenExpired } from '../../utils/tokenUtils';

const PrivateRoute = () => {
  const location = useLocation();
  const token = localStorage.getItem("authToken");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("authToken");
    localStorage.setItem("isLoggedIn", "false");
    return <Navigate to="/login-admin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
