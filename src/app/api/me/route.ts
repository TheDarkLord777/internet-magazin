import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ ok: false });
    
    const payload = verifyAuthToken(token);
    if (!payload) return NextResponse.json({ ok: false });

    await connectToDatabase();
    const user = await User.findById(payload.uid);
    if (!user) return NextResponse.json({ ok: false });

    return NextResponse.json({ 
      ok: true, 
      user: { 
        uid: user._id.toString(), 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        locations: user.locations || [],
      } 
    });
  } catch {
    return NextResponse.json({ ok: false });
  }
}


