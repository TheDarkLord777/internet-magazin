"use client";
import { useState } from "react";
import Input from "@/components/Input";
import PhoneUzInput from "@/components/PhoneUzInput";
import Button from "@/components/Button";

export default function RegisterPage() {
  const [step, setStep] = useState<"phone" | "code" | "password">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSend() {
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneE164: `+998${phone}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStep("code");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneE164: `+998${phone}`, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStep("password");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword() {
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneE164: `+998${phone}`, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      window.location.href = "/login";
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
          <h1 className="text-3xl font-semibold">Ro'yxatdan o'tish</h1>
          <p className="mt-2 text-sm text-gray-600">Telefon raqam orqali tez va xavfsiz.</p>
        </div>
        {error ? (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        ) : null}
        {step === "phone" && (
          <div className="space-y-4">
            <PhoneUzInput label="Telefon" value={phone} onChange={setPhone} />
            <div className="flex justify-center">
            <Button onClick={handleSend} loading={loading} className="w-full">
              SMS yuborish
            </Button>
            </div>
            <p className="text-center text-sm text-gray-600">
              Raqam ro'yxatda bo'lmasa, tasdiqlash kodi yuboramiz.
            </p>
          </div>
        )}
        {step === "code" && (
          <div className="space-y-4">
            <Input label="SMS kodi" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button onClick={handleVerify} loading={loading} className="w-full">
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
            <p className="text-sm text-gray-600">
              Kamida 8 belgi, katta-kichik harf, raqam va maxsus belgi bo'lsin.
            </p>
            <Button onClick={handleSetPassword} loading={loading} className="w-full">
              Parolni o'rnatish
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


