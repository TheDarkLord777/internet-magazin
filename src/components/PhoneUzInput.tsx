"use client";
import React from "react";

type Props = {
  label?: string;
  value: string; // 9 digits only
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  glow?: boolean;
};

export default function PhoneUzInput({ label, value, onChange, error, className = "", glow = true }: Props) {
  function formatUzPhone(digits: string): string {
    const d = digits.replace(/\D/g, "").slice(0, 9);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 5);
    const p3 = d.slice(5, 7);
    const p4 = d.slice(7, 9);
    return [p1, p2, p3, p4].filter(Boolean).join(" ");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 9);
    onChange(onlyDigits);
  }

  const displayValue = formatUzPhone(value);

  const inputEl = (
    <div className={`relative w-full ${className}`}>
      {glow ? (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 blur-lg opacity-60 animate-pulse" />
      ) : null}
      <div className={`relative z-10 flex items-center overflow-hidden rounded-xl border ${glow ? "border-gray-700 bg-black/80" : "bg-white"}`}>
        <span className="px-3 py-2 text-sm font-medium text-white">+998</span>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="00 000 00 00"
          value={displayValue}
          onChange={handleChange}
          maxLength={12}
          className={`flex-1 bg-transparent px-3 py-3 text-white placeholder-gray-400 outline-none caret-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {label ? <label className="mb-2 block text-sm text-gray-300">{label}</label> : null}
      {inputEl}
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}


