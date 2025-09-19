import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { sendSmsVerification } from "@/lib/eskiz";
import { z } from "zod";

const schema = z.object({ phoneE164: z.string().regex(/^\+998\d{9}$/) });

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneE164 } = schema.parse(body);
    await connectToDatabase();

    const existing = await User.findOne({ phoneE164 });
    if (existing && existing.passwordHash) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
    }

    const otp = generateOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    // Send SMS first; only persist OTP if SMS succeeds
    await sendSmsVerification(phoneE164, `Bu Eskiz dan test`);

    // Upsert user with OTP fields; allow resends for unverified users
    await User.updateOne(
      { phoneE164 },
      {
        $set: { otpCode: otp, otpExpiresAt: expires },
        $setOnInsert: { phoneE164 },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err?.message || "Failed to send SMS";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


