import React from "react";

export default function EmptyState({
  title = "Nothing here yet",
  description = "Please check back later.",
  action,
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      {/* Icon */}
      {/* <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 6h18M3 12h18M3 18h18"
            stroke="#63953A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div> */}

      {/* Text */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 max-w-md mb-6">
        {description}
      </p>

      {/* Optional action */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
