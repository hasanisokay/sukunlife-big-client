"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SERVER } from "@/constants/urls.mjs";
import { Flip, toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import bgImage from "@/../public/bgImages/login_page_bg.jpeg"
import Image from "next/image";
import SubmitButton from "../ui/btn/SubmitButton";

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
  const user = useSelector((state) => state.user.userData);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    if (data?.status === 200) {
      toast.success(data?.message)
      window.location.href = "/login"
    } else {
      toast.error(data?.message)
      setServerError(data?.message || "ERROR")
    }
  };
  useEffect(() => {
    if (user) {
      router.replace("/")
    }
  }, [user])
  return (
    <div className="h-[890px]">
      <div className="absolute top-0 bottom-0 right-0 left-0 h-[900px]">
        <Image className="w-full h-[1000px]  object-cover pointer-events-none select-none" src={bgImage} width={1000} height={1000} alt="login-background-image" />
      </div>
      <div className="relative">
        <div className="w-full max-h-[900px] absolute lg:top-[100px] top-[20px] left-1/2 transform -translate-x-1/2  max-w-md bg-white bg-opacity-75 p-6 rounded-3xl shadow-md ">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold mb-6 font-georgia text-black">Welcome to <span className="text-green">Sukunlife</span></h2>
            <div className="text-[13px] text-black">
              <p>Have an Account ?</p>
              <Link className="text-green hover:underline" href="/login" >
                Sign in
              </Link>
            </div>
          </div>
          <p className="sacramento-font text-[55px] font-medium text-black mb-[46px]">Sign up</p>
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

            <div className="mt-[48px] text-right">
              <SubmitButton
                loading={loading}
                onsubmit={handleSubmit(onSubmit)}
              // styles="btn-submit"
              />
            </div>
          </form>

        </div>
      </div>
      <ToastContainer transition={Flip} />
    </div>
  );
}
