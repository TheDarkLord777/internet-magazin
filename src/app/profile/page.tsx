"use client";
import { useEffect, useState } from "react";
import Button from "@/components/Button";

export default function ProfilePage() {
  const [user, setUser] = useState<{ uid: string; phoneE164: string } | null>(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (!user) {
    return <p className="mt-6">You are not logged in.</p>;
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="rounded-md border p-4">
        <p>
          <span className="font-medium">User ID:</span> {user.uid}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {user.phoneE164}
        </p>
      </div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}


