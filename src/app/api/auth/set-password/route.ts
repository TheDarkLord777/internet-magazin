import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  phoneE164: z.string().regex(/^\+998\d{9}$/),
  password: z
    .string()
    .min(8)
    .refine((pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd), {
      message: "Weak password",
    }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneE164, password } = schema.parse(body);
    await connectToDatabase();

    const user = await User.findOne({ phoneE164 });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Ensure SMS verification done (otp cleared)
    if (user.otpCode || user.otpExpiresAt) {
      return NextResponse.json({ error: "Phone not verified" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    user.passwordHash = hash;
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err?.message || "Failed to set password";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


