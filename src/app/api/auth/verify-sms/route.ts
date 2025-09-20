// Deprecated SMS route; keep for backward-compatibility returning 410
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "SMS verification disabled. Use email." }, { status: 410 });
}


