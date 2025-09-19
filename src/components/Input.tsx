"use client";
import React, { useMemo, useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  passwordToggle?: boolean;
  glow?: boolean; // enables the fancy glow wrapper
  leftIcon?: React.ReactNode;
  wrapperClassName?: string; // override width wrapper
};

export default function Input({
  label,
  error,
  passwordToggle = false,
  glow = false,
  leftIcon,
  className = "",
  wrapperClassName,
  type,
  placeholder,
  ...rest
}: Props) {
  const [visible, setVisible] = useState(false);
  const isPassword = useMemo(() => type === "password", [type]);
  const effectiveType = passwordToggle && isPassword ? (visible ? "text" : "password") : type;

  // Default styles
  const baseInput = `w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500`;

  if (glow) {
    return (
      <div className="w-full">
        {label ? <label className="mb-2 block text-sm text-gray-300">{label}</label> : null}
        <div className={`relative ${wrapperClassName || "w-[300px]"}`}>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 blur-lg opacity-60 animate-pulse" />
          <input
            type={effectiveType}
            placeholder={placeholder || "+998 xx xxx xx xx"}
            className={`relative z-10 w-full rounded-xl border border-gray-700 bg-black/80 ${leftIcon ? "pl-12" : "pl-4"} pr-12 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
            {...rest}
          />
          {leftIcon ? (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">{leftIcon}</span>
          ) : null}
          {passwordToggle && isPassword ? (
            <button
              type="button"
              aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-300 hover:text-white"
            >
              {visible ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3l18 18" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 12s3.5-7 10-7c2.028 0 3.82.624 5.263 1.55M22 12s-3.5 7-10 7c-2.2 0-4.132-.64-5.78-1.66" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          ) : null}
        </div>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="w-full">
      {label ? <label className="mb-1 block text-sm text-gray-700">{label}</label> : null}
      <div className="relative">
        <input
          type={effectiveType}
          placeholder={placeholder}
          className={`${baseInput} ${leftIcon ? "pl-10" : ""} ${className}`}
          {...rest}
        />
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span>
        ) : null}
        {passwordToggle && isPassword ? (
          <button
            type="button"
            aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {visible ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3l18 18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 12s3.5-7 10-7c2.028 0 3.82.624 5.263 1.55M22 12s-3.5 7-10 7c-2.2 0-4.132-.64-5.78-1.66" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
