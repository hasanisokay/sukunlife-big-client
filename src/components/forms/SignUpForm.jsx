"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SERVER } from "@/constants/urls.mjs";
import { Flip, toast, ToastContainer } from "react-toastify";

const signupSchema = z
  .object({
    name: z.string().nonempty("Full name is required"),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Must be a valid email address"),
    mobile: z
      .string()
      .nonempty("Mobile number is required")
      .refine((value) => /^[0-9]{11}$/.test(value), {
        message: "Mobile number must be 11 digits",
      }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error path for better display
  });

export default function SignupForm() {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (d) => {
    const res = await fetch(`${SERVER}/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify(d),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data)
    if (data?.status === 200) {
      toast.success(data?.message)
      window.location.href = "/login"
    }else{
      toast.error(data?.message)
      setServerError(data?.message || "ERROR")
    }
  };

  return (
    <div className="flex justify-center md:items-center h-screen bg-primary text-primary">
      <div className="w-full max-w-md bg-secondary p-6 rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-secondary"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className={`w-full mt-1 px-4 py-2 border ${errors.name ? "border-red-500" : "border"
                } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-secondary"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`w-full mt-1 px-4 py-2 border ${errors.email ? "border-red-500" : "border"
                } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-secondary"
            >
              Mobile Number
            </label>
            <input
              type="text"
              id="mobile"
              {...register("mobile")}
              className={`w-full mt-1 px-4 py-2 border ${errors.mobile ? "border-red-500" : "border"
                } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-500">{errors.mobile.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-secondary"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className={`w-full mt-1 px-4 py-2 border ${errors.password ? "border-red-500" : "border"
                } rounded-md bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-link`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
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
                {errors?.confirmPassword?.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="mb-4 text-sm text-red-500">{serverError}</p>
          )}

          <button
            type="submit"
            role="button"
            className="btn-sm w-full btn-submit"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="link">
              Login
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer transition={Flip} />
    </div>
  );
}
