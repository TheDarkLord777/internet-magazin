import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { verifyAuthToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { z } from "zod";

const removeLocationSchema = z.object({
  location: z.string().min(1, "Location cannot be empty"), // This will be placeId for new locations
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyAuthToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { location } = removeLocationSchema.parse(body);

    await connectToDatabase();
    const user = await User.findById(payload.uid);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Remove location from array by placeId
    await User.findByIdAndUpdate(
      payload.uid,
      { 
        $pull: { 
          locations: { placeId: location }
        } 
      },
      { new: true }
    );

    return NextResponse.json({ 
      message: "Location removed successfully",
      location 
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data", details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Remove location failed" }, { status: 500 });
  }
}
