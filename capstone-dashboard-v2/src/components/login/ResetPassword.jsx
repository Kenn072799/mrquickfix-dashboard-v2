import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import { useAdminData } from "../../data/AdminData";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const { resetPassword, loading, error, message } = useAdminData();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Passwords do not match. Please try again.",
      });
      return;
    }

    try {
      await resetPassword(token, newPassword);
      if (message) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: message,
        });
        navigate("/login-admin", { replace: true });
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
      });
    }
  }, [error]);

  return (
    <div className="h-screen bg-secondary-100">
      <div className="flex h-full items-center justify-center text-center">
        <div className="w-full max-w-[400px] rounded-lg bg-white shadow-lg">
          <div className="p-4">
            <Title size="xl">Reset Password</Title>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center gap-4 p-4"
          >
            <input
              type="password"
              id="newPassword"
              className="input input-bordered w-full text-lg"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              id="confirmPassword"
              className="input input-bordered w-full text-lg"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-neutral btn-active w-full border-none bg-primary-500 text-lg hover:bg-primary-600"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Confirm Reset"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
