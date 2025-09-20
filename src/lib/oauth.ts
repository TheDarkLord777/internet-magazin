const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const OAUTH_REDIRECT_URL = process.env.OAUTH_REDIRECT_URL || ""; // e.g. https://yourapp.com/api/auth/oauth/callback

export function getGoogleAuthUrl(state: string): string {
  if (!GOOGLE_CLIENT_ID || !OAUTH_REDIRECT_URL) throw new Error("Google OAuth not configured");
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: OAUTH_REDIRECT_URL,
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/gmail.send",
    prompt: "consent",
    access_type: "offline",
    include_granted_scopes: "true",
    state,
  });
  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !OAUTH_REDIRECT_URL) throw new Error("Google OAuth not configured");
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: OAUTH_REDIRECT_URL,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token_exchange_failed:${res.status}:${text}`);
  }
  return (await res.json()) as { access_token: string; id_token?: string; refresh_token?: string; expires_in?: number };
}

export async function fetchGoogleUser(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`userinfo_failed:${res.status}:${text}`);
  }
  return (await res.json()) as { sub: string; email: string; email_verified?: boolean; name?: string; picture?: string };
}


