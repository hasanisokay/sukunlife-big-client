"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentFailed() {
  const params = useSearchParams();
  const router = useRouter();

  const invoice = params.get("invoice");
  const message = params.get("message");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
        
        <div className="text-5xl mb-4">❌</div>

        <h1 className="text-2xl font-bold text-red-600">
          Payment Failed
        </h1>

        <p className="text-gray-600 mt-3">
          Unfortunately, your payment could not be completed.
        </p>

        {message && (
          <p className="mt-2 text-sm text-red-500">
            Reason: {decodeURIComponent(message)}
          </p>
        )}

        {invoice && (
          <p className="mt-4 text-sm text-gray-500">
            Invoice ID: <span className="font-medium">{invoice}</span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-full bg-[#63953a] text-white font-medium hover:bg-[#4a5e3a] transition"
          >
            Try Again
          </button>

          <button
            onClick={() => router.push("/contact")}
            className="w-full py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}
