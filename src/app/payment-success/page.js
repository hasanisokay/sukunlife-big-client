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
  const hasFinalized = useRef(false);

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

        // if (!res.ok) {
        //   throw new Error("Failed to finalize payment");
        // }

        const data = await res.json();
        console.log("Payment finalized:", data);
      } catch (error) {
        console.error("Finalize payment error:", error);
      } finally {
        setLoading(false);
      }
    };

    finalizePayment();
  }, [invoice]);

  if (loading) {
    return <p className="text-center mt-10">Processing payment, please wait...</p>;
  }

  const title =
    source === "shop" ? "Order Confirmed" : "Appointment Confirmed";

  const subtitle =
    source === "shop"
      ? "Your payment was successful and your order is being processed."
      : "Your payment was successful and your appointment has been booked.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
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
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

        {/* Subtitle */}
        <p className="mt-2 text-gray-600">{subtitle}</p>

        {/* Invoice */}
        {invoice && (
          <p className="mt-4 text-sm text-gray-500">
            Invoice Number:
            <span className="ml-1 font-medium text-gray-700">
              {invoice}
            </span>
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          {isLoggedIn && invoice && (
            <button
              onClick={() =>
                window.open(
                  `${SERVER}/api/paystation/invoice/${invoice}`,
                  "_blank"
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
            >
              View / Print Invoice
            </button>
          )}

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
          >
            Go to Home
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-400">
          A confirmation has been recorded in our system.
          <br />
          If you need help, please contact support.
        </p>
      </div>
    </div>
  );
}
