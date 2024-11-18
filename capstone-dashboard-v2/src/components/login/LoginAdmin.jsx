import React, { useState } from "react";
import { Title } from "../props/Title";
import { useNavigate, useLocation, Link } from "react-router-dom";
import bg from "../../assets/bg.webp";
import logo from "../../assets/Mr.QuickFixLogo.webp";
import { TbEye, TbEyeClosed } from "react-icons/tb";
import { useAdminData } from "../../data/AdminData";
import Swal from "sweetalert2";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginAdmin, loading } = useAdminData();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Please fill in all fields.",
      });
      return;
    }

    try {
      const formData = { email, password };
      const userData = await loginAdmin(formData);

      if (userData && userData.user) {
        localStorage.setItem("userID", userData.user._id);
        localStorage.setItem("token", userData.token);
      }

      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          err.response?.data?.message ||
          "Invalid email or password. Please try again.",
      });
    }
  };

  return (
    <div className="relative h-screen bg-secondary-50">
      <img
        src={bg}
        alt="bg"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-primary-900/30">
        <div className="flex w-full max-w-[400px] flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-lg">
          <div className="flex items-end justify-center py-4">
            <img src={logo} alt="logo" className="h-12" />
            <Title size="xl">Admin</Title>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center gap-4"
          >
            <input
              type="email"
              className="input input-bordered w-full text-lg"
              autoFocus
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full text-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1 text-lg hover:bg-neutral-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <TbEye />
                ) : (
                  <TbEyeClosed className="text-secondary-500" />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="btn btn-neutral btn-active w-full border-none bg-primary-500 text-lg hover:bg-primary-600"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <div className="pt-4">
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
