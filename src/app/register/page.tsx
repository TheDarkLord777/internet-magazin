"use client";
import { useState } from "react";
import Input from "@/components/Input";
import PhoneUzInput from "@/components/PhoneUzInput";
import Button from "@/components/Button";

export default function RegisterPage() {
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const codeValid = /^\d{6}$/.test(code);
  const pwdLen = password.length >= 8;
  const pwdUpper = /[A-Z]/.test(password);
  const pwdLower = /[a-z]/.test(password);
  const pwdNum = /\d/.test(password);
  const pwdSpec = /[^A-Za-z0-9]/.test(password);
  const passwordStrong = pwdLen && pwdUpper && pwdLower && pwdNum && pwdSpec;

  async function handleSend() {
    setError(undefined);
    setSuccess(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStep("code");
      setSuccess("Kodni emailingizga yubordik. 5 daqiqa ichida kiriting.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError(undefined);
    setSuccess(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStep("password");
      setSuccess("Tasdiqlandi! Endi parol o'rnating.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword() {
    setError(undefined);
    setSuccess(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || "Login failed");
      setSuccess("Hisob yaratildi va tizimga kirdingiz.");
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
          <h1 className="text-3xl font-semibold">Ro&apos;yxatdan o&apos;tish</h1>
          <p className="mt-2 text-sm text-gray-600">Email orqali tez va xavfsiz.</p>
        </div>
        {error ? (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-green-700">
            {success}
          </div>
        ) : null}
        {step === "email" && (
          <div className="space-y-4">
            <a href="/api/auth/oauth/start" className="inline-flex w-full items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google bilan davom etish
            </a>
            <div className="relative py-2 text-center text-sm text-neutral-500">
              <span className="bg-white px-2 dark:bg-neutral-900">yoki</span>
            </div>
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex justify-center">
            <Button onClick={handleSend} loading={loading} className="w-full" disabled={!emailValid}>
              Email yuborish
            </Button>
            </div>
            <p className="text-center text-sm text-gray-600">
              Email ro&apos;yxatda bo&apos;lmasa, tasdiqlash kodi yuboramiz.
            </p>
          </div>
        )}
        {step === "code" && (
          <div className="space-y-4">
            <Input label="Email kodi" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button onClick={handleVerify} loading={loading} className="w-full" disabled={!codeValid}>
              Tasdiqlash
            </Button>
            <p className="text-center text-sm text-gray-600">Kod 5 daqiqa davomida amal qiladi.</p>
          </div>
        )}
        {step === "password" && (
          <div className="space-y-4">
            <Input
              label="Yangi parol"
              type="password"
              passwordToggle
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">Parol talablari:</p>
              <ul className="ml-4 list-disc text-gray-600">
                <li className={pwdLen ? "text-green-600" : undefined}>Kamida 8 belgi</li>
                <li className={pwdUpper ? "text-green-600" : undefined}>Katta harf</li>
                <li className={pwdLower ? "text-green-600" : undefined}>Kichik harf</li>
                <li className={pwdNum ? "text-green-600" : undefined}>Raqam</li>
                <li className={pwdSpec ? "text-green-600" : undefined}>Maxsus belgi</li>
              </ul>
            </div>
            <Button onClick={handleSetPassword} loading={loading} className="w-full" disabled={!passwordStrong}>
              Parolni o&apos;rnatish
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


