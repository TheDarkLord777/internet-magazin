"use client";
import { useState } from "react";
import Input from "@/components/Input";
import PhoneUzInput from "@/components/PhoneUzInput";
import Button from "@/components/Button";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
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
        body: JSON.stringify({ phoneE164: `+998${phone}`, password }),
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
          <p className="mt-1 text-sm text-gray-600">Telefon raqam va parol bilan.</p>
        </div>
        {error ? (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <PhoneUzInput
            label="Telefon"
            value={phone}
            onChange={setPhone}
          />
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
        </div>
      </div>
    </div>
  );
}
