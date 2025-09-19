import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ ok: false });
    const payload = verifyAuthToken(token);
    return NextResponse.json({ ok: true, user: { uid: payload.uid, phoneE164: payload.phoneE164 } });
  } catch {
    return NextResponse.json({ ok: false });
  }
}


