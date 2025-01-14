"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

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

export default function IdentityForm() {
  const [step, setStep] = useState("requestOTP");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(step === "requestOTP" ? identitySchema : otpSchema),
  });

  const handleRequestOTP = (data) => {
    console.log(data);
    setSuccessMessage("OTP has been sent to your email or mobile.");
    setServerError("");
    setStep("verifyOTP");
  };

  const handleVerifyOTP = (data) => {
    console.log(data);
    setSuccessMessage("OTP verified! You can now reset your password.");
    setServerError("");
  };

  const onSubmit = step === "requestOTP" ? handleRequestOTP : handleVerifyOTP;

  return (
    <div className="flex justify-center md:items-center h-screen bg-primary text-primary">
      <div className="w-full max-w-md bg-secondary p-6 rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold mb-6">
          {step === "requestOTP" ? "Forgot Password" : "Enter OTP"}
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
            below to verify your identity.
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
                className={`w-full mt-1 px-4 py-2 border ${
                  errors.userIdentifier ? "border-red-500" : "border"
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
                className={`w-full mt-1 px-4 py-2 border ${
                  errors.otp ? "border-red-500" : "border"
                } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-500">{errors.otp.message}</p>
              )}
            </div>
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
            {step === "requestOTP" ? "Send OTP" : "Verify OTP"}
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
