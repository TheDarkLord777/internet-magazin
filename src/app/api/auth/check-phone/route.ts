import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);
    await connectToDatabase();
    const existing = await User.findOne({ email }).lean();
    return NextResponse.json({ exists: !!existing });
  } catch (err: any) {
    const message = err?.message || "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


