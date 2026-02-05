'use client';

import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          404
        </h1>
        <div className="mx-auto my-4 h-1 w-12 rounded-full bg-[#7ebc12]" />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-[#7ebc12] px-5 py-2.5 text-sm font-medium text-black shadow-md transition hover:scale-105 hover:shadow-lg"
          >
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
