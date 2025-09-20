"use client";
import { useState } from "react";
import Input from "@/components/Input";
import PhoneUzInput from "@/components/PhoneUzInput";
import Button from "@/components/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleLogin() {
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      window.location.href = "/";
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center p-4">
      <div className="w-full rounded-xl border bg-white/70 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">Kirish</h1>
          <p className="mt-1 text-sm text-gray-600">Email va parol bilan.</p>
        </div>
        {error ? (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <Input label="Email" type="email" placeholder="********@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Parol"
            type="password"
            passwordToggle
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-center">
            <Button onClick={handleLogin} loading={loading}>
              Kirish
            </Button>
          </div>
          <div className="text-center">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Parolni unutdingizmi?
            </a>
          </div>
          <div className="relative py-2 text-center text-sm text-neutral-500">
            <span className="bg-white px-2 dark:bg-neutral-900">yoki</span>
          </div>
          <a href="/api/auth/oauth/start" className="inline-flex w-full items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google bilan davom etish
          </a>
        </div>
      </div>
    </div>
  );
}
