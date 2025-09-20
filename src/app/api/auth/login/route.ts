import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signAuthToken } from "@/lib/jwt";
import { cookies } from "next/headers";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signAuthToken({ uid: user._id.toString(), email });
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err?.message || "Login failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


