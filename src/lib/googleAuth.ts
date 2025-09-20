export async function refreshGoogleAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  if (!refreshToken || !clientId || !clientSecret) throw new Error("Google OAuth not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`refresh_failed:${res.status}:${text}`);
  }
  const data = await res.json();
  return {
    accessToken: data.access_token as string,
    expiresAt: Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000),
  };
}


