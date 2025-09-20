import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    
    return NextResponse.json({ ok: true, message: "Logged out successfully" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to logout" }, { status: 500 });
  }
}