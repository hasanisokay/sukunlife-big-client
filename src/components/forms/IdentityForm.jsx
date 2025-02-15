"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SERVER } from "@/constants/urls.mjs";

const identitySchema = z.object({
  userIdentifier: z
    .string()
    .nonempty("Mobile number or email is required")
    .refine(
      (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[0-9]{10}$/.test(value),
      { message: "Must be a valid email or mobile number" }
    ),
});

const otpSchema = z.object({
  otp: z
    .string()
    .nonempty("OTP is required")
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function IdentityForm() {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [typedOtp, setTypedOtp] = useState("");

  const [step, setStep] = useState("requestOTP");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [timer, setTimer] = useState(1800); // 30 minutes in seconds

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(
      step === "requestOTP"
        ? identitySchema
        : step === "verifyOTP"
          ? otpSchema
          : passwordSchema
    ),
  });

  useEffect(() => {
    if (step === "verifyOTP" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleRequestOTP = async (data) => {
    const res = await fetch(`${SERVER}/api/auth/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (resData.status === 200) {
      setUserIdentifier(data?.userIdentifier)
      setSuccessMessage("OTP has been sent to your email. It will expire within 30 minutes.");
      setServerError("");
      setStep("verifyOTP");
      setTimer(1800); // Reset timer to 30 minutes
    } else {
      setServerError(resData?.message);
    }
  };

  const handleVerifyOTP = async (data) => {
    const res = await fetch(`${SERVER}/api/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...data, userIdentifier })
    });
    const resData = await res.json();
    if (resData.status === 200) {
      setTypedOtp(data?.otp)
      setSuccessMessage("OTP verified! You can now reset your password.");
      setServerError("");
      setStep("resetPassword");
    } else {
      setServerError(resData?.message);
    }
  };

  const handleResetPassword = async (data) => {
    const res = await fetch(`${SERVER}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...data, otp: typedOtp, userIdentifier })
    });
    const resData = await res.json();
    console.log(resData)
    if (resData.status === 200) {
      setSuccessMessage("Password has been reset successfully. Redirecting to Login page.");
      setServerError("");
      redirectToLogin()
    } else {
      setServerError(resData?.message);
    }
  };

  const redirectToLogin = () => {
    setTimeout(() => {
      window.location.href = '/login';
    }, 3000);
  }

  const onSubmit =
    step === "requestOTP"
      ? handleRequestOTP
      : step === "verifyOTP"
        ? handleVerifyOTP
        : handleResetPassword;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div className="flex justify-center md:items-center h-screen bg-primary text-primary">
      <div className="w-full max-w-md bg-secondary p-6 rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold mb-6">
          {step === "requestOTP"
            ? "Forgot Password"
            : step === "verifyOTP"
              ? "Enter OTP"
              : "Reset Password"}
        </h2>

        {step === "requestOTP" && (
          <p className="mb-4 text-sm text-secondary">
            Enter your email address or mobile number, and we’ll send you an OTP
            to verify your identity.
          </p>
        )}

        {step === "verifyOTP" && (
          <p className="mb-4 text-sm text-secondary">
            We’ve sent a 6-digit OTP to your email or mobile. Please enter it
            below to verify your identity. OTP will expire in {formatTime(timer)}.
          </p>
        )}

        {step === "resetPassword" && (
          <p className="mb-4 text-sm text-secondary">
            Please enter your new password and confirm it.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {step === "requestOTP" && (
            <div className="mb-4">
              <label
                htmlFor="userIdentifier"
                className="block text-sm font-medium text-secondary"
              >
                Mobile Number or Email
              </label>
              <input
                type="text"
                id="userIdentifier"
                {...register("userIdentifier")}
                className={`w-full mt-1 px-4 py-2 border ${errors.userIdentifier ? "border-red-500" : "border"
                  } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
              />
              {errors.userIdentifier && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.userIdentifier.message}
                </p>
              )}
            </div>
          )}

          {step === "verifyOTP" && (
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-secondary"
              >
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                {...register("otp")}
                className={`w-full mt-1 px-4 py-2 border ${errors.otp ? "border-red-500" : "border"
                  } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-500">{errors.otp.message}</p>
              )}
            </div>
          )}

          {step === "resetPassword" && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-secondary"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  {...register("newPassword")}
                  className={`w-full mt-1 px-4 py-2 border ${errors.newPassword ? "border-red-500" : "border"
                    } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-secondary"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  className={`w-full mt-1 px-4 py-2 border ${errors.confirmPassword ? "border-red-500" : "border"
                    } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </>
          )}

          {serverError && (
            <p className="mb-4 text-sm text-red-500">{serverError}</p>
          )}
          {successMessage && (
            <p className="mb-4 text-sm text-green-500">{successMessage}</p>
          )}

          <button
            type="submit"
            role="button"
            className="btn-sm w-full btn-submit"
          >
            {step === "requestOTP"
              ? "Send OTP"
              : step === "verifyOTP"
                ? "Verify OTP"
                : "Reset Password"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link href="/login" className="link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}