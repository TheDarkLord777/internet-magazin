"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "default" | "outline";
};

export default function Button({
  loading,
  className = "",
  children,
  disabled,
  variant = "default",
  ...rest
}: Props) {
  if (variant === "outline") {
    return (
      <button
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center 
          px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 
          bg-white border border-gray-300 rounded-md hover:bg-gray-50 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
          disabled:opacity-60 dark:bg-neutral-800 dark:text-gray-300 
          dark:border-neutral-600 dark:hover:bg-neutral-700 ${className}`}
        {...rest}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  }

  return (
    <div className="relative inline-flex group">
      {/* Glow background */}
      <div
        className="absolute transition-all duration-1000 opacity-70 -inset-px 
        bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] 
        rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 
        group-hover:duration-200 animate-tilt"
      ></div>

      <button
        disabled={disabled || loading}
        className={`relative inline-flex items-center justify-center 
          px-8 py-4 text-lg font-bold text-white transition-all duration-200 
          bg-gray-900 rounded-xl focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-60 ${className}`}
        {...rest}
      >
        {loading ? "Loading..." : children}
      </button>
    </div>
  );
}
