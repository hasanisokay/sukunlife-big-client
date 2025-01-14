'use client'
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SERVER } from "@/constants/urls.mjs";
import SubmitButton from "../ui/btn/SubmitButton";


const loginSchema = z.object({
  userIdentifier: z
    .string()
    .nonempty("Mobile number or email is required")
    .refine(
      (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[0-9]{10}$/.test(value),
      { message: "Must be a valid email or mobile number" }
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginForm({ redirectTo }) {
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (d) => {
    setLoading(true);
    const res = await fetch(`${SERVER}/auth/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(d),
      credentials: 'include'
    })
    const data = await res.json();
    setLoading(false);
    if (data.status === 200) {
      window.location.href = redirectTo || "/"
    } else {
      setServerError(data?.message || "ERROR")
    }
  };

  return (
    <div className="flex justify-center md:items-center h-screen bg-primary text-primary">
      <div className="w-full max-w-md bg-secondary p-6 rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold mb-6">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

          {serverError && (
            <p className="mb-4 text-sm text-red-500">{serverError}</p>
          )}
          {/* <button
            type="submit"
            role="button"
            disabled={loading}
            className="btn-sm w-full  btn-submit"
          >
            {loading ? <span className="btn-loader"></span> : <span className="inline-block">Login</span>}
          </button> */}
          <SubmitButton
            loading={loading}
            onsubmit={handleSubmit(onSubmit)}
            styles="btn-submit"
          />
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link href="/signup" className="link">
            Sign up
          </Link>
          <Link href="/identity" className="link">
            Forgot password?
          </Link>
        </div>
      </div>
      {/* <ToastContainer /> */}
    </div>
  );
}
