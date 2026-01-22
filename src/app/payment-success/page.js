"use client";

import { SERVER } from "@/constants/urls.mjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export default function PaymentSuccess() {
  const params = useSearchParams();
  const router = useRouter();

  const user = useSelector((state) => state.user.userData);
  const isLoggedIn = Boolean(user && Object.keys(user).length);

  const invoice = params.get("invoice");
  const source = params.get("source");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("success"); // success | error
  const [message, setMessage] = useState("");

  const hasFinalized = useRef(false);
  const redirectTimer = useRef(null);

  useEffect(() => {
    if (!invoice || hasFinalized.current) {
      setLoading(false);
      return;
    }

    hasFinalized.current = true;

    const finalizePayment = async () => {
      try {
        const res = await fetch(
          `${SERVER}/api/paystation/finalize-payment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invoice_number: invoice }),
          }
        );

        const data = await res.json();

        const isAlreadyProcessed = data?.alreadyProcessed === true;
        const isConfirmed =
          data?.success === true

        if (isAlreadyProcessed) {
          setStatus("success");
          setMessage("This order was already processed earlier.");
          // startRedirect();
        } else if (isConfirmed) {
          setStatus("success");
          setMessage("Your order has been confirmed.");
          // startRedirect();
        } else {
          setStatus("error");
          setMessage(data?.message || "Payment verification failed.");
        }
      } catch (err) {
        console.error("Finalize payment error:", err);
        setStatus("error");
        setMessage("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    finalizePayment();

    return cancelRedirect;
  }, [invoice]);

  const startRedirect = () => {
    redirectTimer.current = setTimeout(() => {
      router.push("/");
    }, 3000);
  };

  const cancelRedirect = () => {
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
      redirectTimer.current = null;
    }
  };

  const handleUserAction = (action) => {
    cancelRedirect();
    action();
  };

  if (loading) {
    return (
      <p className="text-center mt-10">
        Processing payment, please wait...
      </p>
    );
  }

  const title =
    status === "success"
      ? source === "shop"
        ? "Order Status"
        : "Appointment Status"
      : "Payment Issue";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            status === "success" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {status === "success" ? (
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{message}</p>

        {invoice && (
          <p className="mt-4 text-sm text-gray-500">
            Invoice Number:
            <span className="ml-1 font-medium text-gray-700">
              {invoice}
            </span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {status === "success"  && invoice && (
            <button
              onClick={() =>
                handleUserAction(() =>
                  window.open(
                    `${SERVER}/api/paystation/invoice/${invoice}`,
                    "_blank"
                  )
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
            >
              View / Print Invoice
            </button>
          )}

          <button
            onClick={() =>
              handleUserAction(() => router.push("/"))
            }
            className={`w-full rounded-lg px-4 py-3 font-medium transition ${
              status === "success"
                ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            Go to Home
          </button>
        </div>
{/* 
        {status === "success" && (
          <p className="mt-6 text-xs text-gray-400">
            You will be redirected automatically in a few seconds.
          </p>
        )} */}
      </div>
    </div>
  );
}
