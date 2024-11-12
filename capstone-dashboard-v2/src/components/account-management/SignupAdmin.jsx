import React, { useState, useEffect } from "react";
import { Title } from "../props/Title";
import { TbX, TbCheck, TbEye, TbEyeClosed } from "react-icons/tb";
import { Step, Stepper } from "@material-tailwind/react";
import { useAdminData } from "../../data/AdminData";
import Swal from "sweetalert2";

const SignupAdmin = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [otpTimer, setOtpTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const { signup, resendOTP, verifyOTP, completeDetails, loading, error } =
    useAdminData();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({ email, password });
      setActiveStep(1);
      Swal.fire(
        "Success",
        "Please check your email for the OTP code.",
        "success",
      );
    } catch (err) {
      console.error("Signup error:", err);
      Swal.fire("Error", error || "An error occurred during signup.", "error");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6 || isNaN(otp)) {
      Swal.fire("Error", "Please enter a valid 6-digit OTP.", "error");
      setOtp("");
      return;
    }

    try {
      const response = await verifyOTP(email, otp);

      if (response && response.success) {
        setActiveStep(2);
        Swal.fire("Success", "OTP verified successfully!", "success");
      } else {
        throw new Error("OTP invalid. Please check it again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err.response || err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "OTP invalid. Please check it again.",
        "error",
      );
    }
  };

  const handleProfileComplete = async (e) => {
    e.preventDefault();
    try {
      await completeDetails({ firstName, lastName, phone }, email);
      onClose();
      Swal.fire("Success", "Registration completed successfully!", "success");
    } catch (err) {
      console.error("Profile completion error:", err);
      Swal.fire(
        "Error",
        error || "An error occurred during profile completion.",
        "error",
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOTP(email);
      Swal.fire("Success", "OTP has been resent to your email.", "success");

      setOtpTimer(120);
      setIsResendDisabled(true);
    } catch (err) {
      console.error("Error resending OTP:", err);
      Swal.fire("Error", "Failed to resend OTP. Please try again.", "error");
    }
  };

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  return (
    <div>
      <div className="flex items-center justify-between rounded-t-md border border-b-0 border-secondary-300 bg-secondary-100 px-4 py-2">
        <Title>Sign Up</Title>
        <div
          className="flex cursor-pointer items-center rounded-full p-2 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-200/50 active:text-secondary-500"
          onClick={activeStep == 1 || activeStep == 2 ? "" : onClose}
        >
          {activeStep == 0 ? (
            <button>
              <TbX />
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-b-md border border-secondary-300 bg-white p-4">
        <div className="mb-4 mt-4 cursor-default bg-white px-4">
          <Stepper activeStep={activeStep}>
            <Step
              className="relative"
              onClick={() => activeStep === 0 && setActiveStep(0)}
            >
              1
            </Step>
            <Step
              className="relative"
              onClick={() => activeStep === 1 && setActiveStep(1)}
            >
              2
            </Step>
            <Step
              className="relative"
              onClick={() => activeStep === 2 && setActiveStep(2)}
            >
              <TbCheck />
            </Step>
          </Stepper>
        </div>
        {activeStep === 0 && (
          <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
            <Title variant="secondaryNormal" size="md">
              Enter your email and password
            </Title>
            <input
              type="email"
              className="input input-bordered w-full text-lg"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full text-lg"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        )}
        {activeStep === 1 && (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <Title variant="secondaryNormal" size="md">
              Check your email for 6-digit OTP code
            </Title>
            <input
              type="text"
              className="input input-bordered w-full text-center text-lg"
              placeholder="6-digit OTP code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-neutral btn-active w-full border-none bg-primary-500 text-lg hover:bg-primary-600"
            >
              Verify
            </button>
            <button
              type="button"
              className={`text-blue-500 hover:underline ${isResendDisabled ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={isResendDisabled ? null : handleResendOtp}
              disabled={isResendDisabled}
            >
              {isResendDisabled
                ? `Resend Code (${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, "0")})`
                : "Resend Code"}
            </button>
          </form>
        )}
        {activeStep === 2 && (
          <form
            onSubmit={handleProfileComplete}
            className="flex flex-col gap-4"
          >
            <Title variant="secondaryNormal" size="md">
              Complete the profile information
            </Title>
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered w-full text-lg"
                placeholder="First name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                className="input input-bordered w-full text-lg"
                placeholder="Last name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <input
              type="text"
              className="input input-bordered w-full text-lg"
              placeholder="Phone number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-neutral btn-active w-full border-none bg-primary-500 text-lg hover:bg-primary-600"
              disabled={loading}
            >
              {loading ? "Completing..." : "Complete"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupAdmin;
