import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { sendVerificationEmail } from "@/lib/sendEmail";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    await connectToDatabase();
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await User.findByIdAndUpdate(user._id, {
      otpCode,
      otpExpiresAt,
    });

    // Send verification email
    await sendVerificationEmail(email, otpCode);

    return NextResponse.json({ 
      message: "Verification code sent to your email" 
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid email address", details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Failed to send verification code" }, { status: 500 });
  }
}
