"use client";
import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  async function handleForgotPassword() {
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center p-4">
        <div className="w-full rounded-xl border bg-white/70 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-green-600 dark:text-green-400">Email yuborildi!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {email} manziliga parolni tiklash uchun verification code yuborildi.
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              Email'ni tekshiring va code bilan parolni tiklang.
            </p>
            <div className="mt-6">
              <a href="/reset-password" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Parolni tiklash
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center p-4">
      <div className="w-full rounded-xl border bg-white/70 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">Parolni tiklash</h1>
          <p className="mt-1 text-sm text-gray-600">Email manzilingizni kiriting.</p>
        </div>
        {error ? (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            placeholder="********@gmail.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <div className="flex justify-center">
            <Button onClick={handleForgotPassword} loading={loading}>
              Verification code yuborish
            </Button>
          </div>
          <div className="text-center">
            <a href="/login" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              ← Login sahifasiga qaytish
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
