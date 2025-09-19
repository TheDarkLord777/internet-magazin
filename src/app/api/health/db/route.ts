import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const state = conn.connection.readyState; // 1=connected
    return NextResponse.json({ ok: state === 1, state });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}


