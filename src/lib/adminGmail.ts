// Admin Gmail sender using service account or admin credentials
const ADMIN_GMAIL_ACCESS_TOKEN = process.env.ADMIN_GMAIL_ACCESS_TOKEN || "";
const ADMIN_GMAIL_REFRESH_TOKEN = process.env.ADMIN_GMAIL_REFRESH_TOKEN || "";
const ADMIN_GMAIL_EMAIL = process.env.ADMIN_GMAIL_EMAIL || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

let cachedAdminToken: string | null = null;
let tokenExpiresAt = 0;

async function refreshAdminToken(): Promise<string> {
  if (!ADMIN_GMAIL_REFRESH_TOKEN || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Admin Gmail credentials not configured");
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: ADMIN_GMAIL_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin token refresh failed: ${res.status}:${text}`);
  }

  const data = await res.json();
  cachedAdminToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000);
  return cachedAdminToken!;
}

async function getAdminToken(): Promise<string> {
  if (cachedAdminToken && Date.now() < tokenExpiresAt) {
    return cachedAdminToken;
  }
  return refreshAdminToken();
}

export async function sendAdminEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
  if (!ADMIN_GMAIL_EMAIL) {
    throw new Error("ADMIN_GMAIL_EMAIL not configured");
  }

  const token = await getAdminToken();
  
  // Import gmailSend from gmail.ts
  const { gmailSend } = await import("./gmail");
  await gmailSend(token, ADMIN_GMAIL_EMAIL, to, subject, text, html);
}
