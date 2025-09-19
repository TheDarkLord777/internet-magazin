"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [dbOk, setDbOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Simple auth check by looking for a non-HTTP-only hint via endpoint
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setIsAuthed(Boolean(data?.ok)))
      .catch(() => setIsAuthed(false));

    fetch("/api/health/db", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDbOk(Boolean(data?.ok)))
      .catch(() => setDbOk(false));
  }, []);

  return (
    <nav className="flex items-center justify-between  px-6 py-3">
      <Link href="/" className="text-lg font-semibold">
        Universal Auth
      </Link>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${dbOk === null ? "bg-gray-200" : dbOk ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          <span className={`size-2 rounded-full ${dbOk === null ? "bg-gray-400" : dbOk ? "bg-green-600" : "bg-red-600"}`} />
          Server
        </span>
        {isAuthed ? (
          <div className="relative">
            <Link href="/profile" className="rounded-full bg-gray-200 px-3 py-2">
              👤 Profile
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}


