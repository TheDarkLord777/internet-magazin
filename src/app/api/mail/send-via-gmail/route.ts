import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { gmailSend } from "@/lib/gmail";
import { refreshGoogleAccessToken } from "@/lib/googleAuth";

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const payload = verifyAuthToken(token);

    await connectToDatabase();
    const user = await User.findById(payload.uid);
    if (!user?.google?.accessToken) return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });

    let accessToken = user.google.accessToken;
    let expiresAt = user.google.tokenExpiresAt ? user.google.tokenExpiresAt.getTime() : 0;
    if (!expiresAt || expiresAt < Date.now()) {
      if (!user.google.refreshToken) return NextResponse.json({ error: "Refresh token missing" }, { status: 401 });
      const refreshed = await refreshGoogleAccessToken(user.google.refreshToken);
      accessToken = refreshed.accessToken;
      user.google.accessToken = accessToken;
      user.google.tokenExpiresAt = new Date(refreshed.expiresAt);
      await user.save();
    }

    await gmailSend(accessToken, user.email, to, subject, html);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Send failed" }, { status: 400 });
  }
}


