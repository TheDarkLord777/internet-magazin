import { NextResponse } from "next/server";
import { exchangeCodeForTokens, fetchGoogleUser } from "@/lib/oauth";
import { connectToDatabase } from "@/lib/db";
import { User, dropLegacyPhoneUniqueIndexIfExists } from "@/lib/user";
import { signAuthToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, url));
    if (!code) return NextResponse.redirect(new URL(`/login?error=missing_code`, url));

    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleUser(tokens.access_token);
    if (!profile.email) return NextResponse.redirect(new URL(`/login?error=no_email`, url));

    await connectToDatabase();
    await dropLegacyPhoneUniqueIndexIfExists();
    const tokenExpiresAt = new Date(Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : 60 * 60 * 1000));
    // Parse name into firstName and lastName
    const nameParts = profile.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const update = {
      $setOnInsert: { 
        email: profile.email,
        firstName: firstName,
        lastName: lastName,
      },
      $set: { google: { sub: profile.sub, accessToken: tokens.access_token, tokenExpiresAt, refreshToken: tokens.refresh_token } },
    };
    const user = await User.findOneAndUpdate({ email: profile.email }, update, { upsert: true, new: true });

    const token = signAuthToken({ uid: user!._id.toString(), email: profile.email });
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.redirect(new URL(`/`, url));
  } catch (e: any) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(e?.message || "oauth_failed")}`, url));
  }
}


