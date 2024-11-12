import React, { useEffect } from "react";
import LoginAdmin from "../components/login/LoginAdmin";

const Login = () => {
  useEffect(() => {
    document.title = "Mr. Quick Fix | Admin Login";
  }, []);
  return (
    <div>
      <LoginAdmin />
    </div>
  );
};

export default Login;
