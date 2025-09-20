import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
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
    const { email, password } = schema.parse(body);
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Ensure email verification done (otp cleared)
    if (user.otpCode || user.otpExpiresAt) {
      return NextResponse.json({ error: "Email not verified" }, { status: 400 });
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


