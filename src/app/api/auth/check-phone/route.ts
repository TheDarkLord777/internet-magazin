import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { z } from "zod";

const schema = z.object({ phoneE164: z.string().regex(/^\+998\d{9}$/) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneE164 } = schema.parse(body);
    await connectToDatabase();
    const existing = await User.findOne({ phoneE164 }).lean();
    return NextResponse.json({ exists: !!existing });
  } catch (err: any) {
    const message = err?.message || "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


