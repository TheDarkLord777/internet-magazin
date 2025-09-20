import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, dropLegacyPhoneUniqueIndexIfExists } from "@/lib/user";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/sendEmail";

const schema = z.object({ email: z.string().email() });

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);
    await connectToDatabase();

    await dropLegacyPhoneUniqueIndexIfExists();
    const existing = await User.findOne({ email });
    if (existing && existing.passwordHash) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const otp = generateOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await sendVerificationEmail(email, `Tasdiqlash kodi: ${otp}`);

    await User.updateOne(
      { email },
      {
        $set: { otpCode: otp, otpExpiresAt: expires },
        $setOnInsert: { email },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err?.message || "Failed to send email";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


