import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/user";
import { verifyAuthToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { z } from "zod";

const addLocationSchema = z.object({
  location: z.union([
    z.string().min(1, "Location cannot be empty").max(100, "Location too long"),
    z.object({
      name: z.string(),
      address: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }),
      placeId: z.string()
    })
  ])
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyAuthToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { location } = addLocationSchema.parse(body);

    await connectToDatabase();
    const user = await User.findById(payload.uid);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Handle both string and object locations
    let locationToAdd;
    if (typeof location === 'string') {
      // Legacy string location
      locationToAdd = location;
      
      // Check if location already exists (for string locations)
      if (user.locations?.some(loc => typeof loc === 'string' && loc === location)) {
        return NextResponse.json({ error: "Location already exists" }, { status: 400 });
      }
    } else {
      // New object location with coordinates
      locationToAdd = location;
      
      // Check if location already exists (for object locations)
      if (user.locations?.some(loc => typeof loc === 'object' && loc.placeId === location.placeId)) {
        return NextResponse.json({ error: "Location already exists" }, { status: 400 });
      }
    }

    // Add location to array
    await User.findByIdAndUpdate(
      payload.uid,
      { $addToSet: { locations: locationToAdd } },
      { new: true }
    );

    return NextResponse.json({ 
      message: "Location added successfully",
      location: locationToAdd 
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data", details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Add location failed" }, { status: 500 });
  }
}
