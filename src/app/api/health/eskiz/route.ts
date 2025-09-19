import { NextResponse } from "next/server";

export async function GET() {
  try {
    const base = process.env.ESKIZ_BASE_URL || "https://notify.eskiz.uz";
    const email = process.env.ESKIZ_EMAIL || "";
    const password = process.env.ESKIZ_PASSWORD || "";
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Missing ESKIZ_EMAIL or ESKIZ_PASSWORD" }, { status: 400 });
    }
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, response: text });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Eskiz check failed" }, { status: 500 });
  }
}


