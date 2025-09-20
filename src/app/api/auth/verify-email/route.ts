import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, dropLegacyPhoneUniqueIndexIfExists } from "@/lib/user";
import { z } from "zod";
import { sendAppEmail } from "@/lib/sendEmail";

const schema = z.object({ email: z.string().email(), code: z.string().length(6) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = schema.parse(body);
    await connectToDatabase();

    await dropLegacyPhoneUniqueIndexIfExists();
    const user = await User.findOne({ email });
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

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const ua = req.headers.get("user-agent") || "unknown";
    await sendAppEmail({
      to: email,
      subject: "Ro'yxatdan o'tish tasdiqlandi",
      text: `Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Kirish IP: ${ip}. Qurilma: ${ua}.`,
      html: `<p>Siz muvaffaqiyatli ro'yxatdan o'tdingiz.</p><p><b>IP:</b> ${ip}<br/><b>Qurilma:</b> ${ua}</p>`,
    });

    return NextResponse.json({ ok: true, message: "Verification successful" });
  } catch (err: any) {
    const message = err?.message || "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


