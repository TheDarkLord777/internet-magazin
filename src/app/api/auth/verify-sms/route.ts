import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { z } from "zod";

const schema = z.object({ phoneE164: z.string().regex(/^\+998\d{9}$/), code: z.string().length(6) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneE164, code } = schema.parse(body);
    await connectToDatabase();

    const user = await User.findOne({ phoneE164 });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ error: "No pending verification" }, { status: 400 });
    }
    if (user.otpCode !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err?.message || "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


