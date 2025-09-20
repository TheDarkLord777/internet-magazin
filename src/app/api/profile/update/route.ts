import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { verifyAuthToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyAuthToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    await connectToDatabase();
    
    const user = await User.findByIdAndUpdate(
      payload.uid,
      { $set: validatedData },
      { new: true }
    );

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: {
        uid: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        locations: user.locations,
      }
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data", details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Update failed" }, { status: 500 });
  }
}
