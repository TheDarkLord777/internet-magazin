"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function Button({
  loading,
  className = "",
  children,
  disabled,
  ...rest
}: Props) {
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
