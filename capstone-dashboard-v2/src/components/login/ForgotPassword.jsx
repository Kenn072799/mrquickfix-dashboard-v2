import React, { useEffect, useState } from "react";
import { Title } from "../props/Title";
import { useAdminData } from "../../data/AdminData";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const { forgotPass, loading, message, error } = useAdminData();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        await forgotPass(email);
        if (message) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: message,
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error || "An error occurred. Please try again later.",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please enter a valid email address.",
      });
    }
  };

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
      });
    }
    if (message) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: message,
      });
    }
  }, [error, message]);

  return (
    <div className="h-screen bg-secondary-100">
      <div className="flex h-full items-center justify-center text-center">
        <div className="w-full max-w-[400px] rounded-lg bg-white shadow-lg">
          <div className="p-4 pb-0">
            <Title size="xl">Forgot Password</Title>
            <p className="text-sm">
              Enter your registered email address and we will send you a
              password reset link.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center gap-4 p-4"
          >
            <input
              type="email"
              className="input input-bordered w-full text-lg"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-neutral btn-active w-full border-none bg-primary-500 text-lg hover:bg-primary-600"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Password Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
