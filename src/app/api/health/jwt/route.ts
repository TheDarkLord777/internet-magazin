import { NextResponse } from "next/server";
import { signAuthToken, verifyAuthToken } from "@/lib/jwt";

export async function GET() {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ ok: false, error: "JWT_SECRET missing" }, { status: 400 });
    }
    const sample = { uid: "healthcheck", email: "health@example.com" };
    const token = signAuthToken(sample);
    const decoded = verifyAuthToken(token);
    return NextResponse.json({ ok: true, token, decoded });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "JWT error" }, { status: 500 });
  }
}


