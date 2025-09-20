import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const confirmation = String(body?.confirm || "").trim();
    if (confirmation !== "DELETE") {
      return NextResponse.json({ error: "Type DELETE to confirm" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const payload = verifyAuthToken(token);

    await connectToDatabase();
    await User.deleteOne({ _id: payload.uid });

    // Clear auth cookie
    cookieStore.set("auth_token", "", { httpOnly: true, path: "/", maxAge: 0 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Delete failed" }, { status: 400 });
  }
}


