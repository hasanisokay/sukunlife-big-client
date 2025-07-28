'use client'
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SERVER } from "@/constants/urls.mjs";
import SubmitButton from "../ui/btn/SubmitButton";
import bgImage from "@/../public/bgImages/login_page_bg.jpeg"
import Image from "next/image";
import SocialIcons from "../shared/SocialIcons";

const loginSchema = z.object({
  userIdentifier: z
    .string()
    .nonempty("Mobile number or email is required")
    .refine(
      (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[0-9]{11}$/.test(value),
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
    try {
      setLoading(true);
      const res = await fetch(`${SERVER}/api/auth/login`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(d),
        credentials: 'include'
      })
      const data = await res.json();
      setLoading(false);

      if (data?.status === 200) {
        const accessToken = data?.accessToken;
        const refreshToken = data?.refreshToken;
        await fetch("/api/login", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ accessToken, refreshToken }),
          credentials: 'include'
        })

        window.location.href = redirectTo || "/"
      } else {
        setServerError(data?.message || "ERROR")
      }
    } catch (e) {
      console.log(e)
    }
  };

  return (
    // <div className="flex justify-center md:items-center h-screen bg-primary text-primary">
    <div className="relative">
      <div className="max-h-[100vh]">
        <Image className="w-full min-h-[100vh] z-0" src={bgImage} width={1000} height={1000} alt="login-background-image" />
      </div>
      <div className="z-10 w-full absolute lg:top-[100px] top-2 left-1/2 transform -translate-x-1/2  max-w-md bg-white bg-opacity-75 p-6 rounded-3xl shadow-md ">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold mb-6 font-georgia text-black">Welcome to <span className="text-green">Sukunlife</span></h2>
          <div className="text-[13px] text-black">
            <p>No Account?</p>
            <Link className="text-green hover:underline" href="/signup" >
              Sign up
            </Link>
          </div>
        </div>
        <p className="sacramento-font text-[55px] font-medium text-black mb-[46px]">Sign in</p>
        <SocialIcons />
        <form className="mt-[52px] montserrat-font tracking-normal" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label
              htmlFor="userIdentifier"
              className="block text-sm font-medium text-secondary"
            >
              Enter your Mobile Number or Email
            </label>
            <input
              placeholder="Mobile Number or Email"
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
             Enter your Password
            </label>
            <input
              placeholder="Password"
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
          <div className="mt-4 text-end text-sm">
            <Link href="/identity" className="link">
              Forgot password
            </Link>
          </div>
          <div className="mt-[48px] text-right">
            <SubmitButton
              loading={loading}
              onsubmit={handleSubmit(onSubmit)}
            // styles="btn-submit"
            />
          </div>
        </form>


      </div>
      {/* <ToastContainer /> */}
    </div>
  );
}
