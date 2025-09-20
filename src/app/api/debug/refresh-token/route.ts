import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    
    const payload = verifyAuthToken(token);
    await connectToDatabase();
    
    const user = await User.findById(payload.uid);
    if (!user?.google?.refreshToken) {
      return NextResponse.json({ error: "No Google refresh token found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      email: user.email,
      refreshToken: user.google.refreshToken,
      hasAccessToken: !!user.google.accessToken,
      tokenExpiresAt: user.google.tokenExpiresAt
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 400 });
  }
}
