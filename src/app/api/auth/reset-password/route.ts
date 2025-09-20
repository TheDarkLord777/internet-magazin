import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().min(6, "Code must be 6 digits").max(6, "Code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = resetPasswordSchema.parse(body);

    await connectToDatabase();
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if OTP code exists and is valid
    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
    }

    // Check if OTP code matches
    if (user.otpCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Check if OTP code is expired
    if (user.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password and clear OTP
    await User.findByIdAndUpdate(user._id, {
      passwordHash,
      otpCode: undefined,
      otpExpiresAt: undefined,
    });

    return NextResponse.json({ 
      message: "Password updated successfully" 
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data", details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Failed to reset password" }, { status: 500 });
  }
}
