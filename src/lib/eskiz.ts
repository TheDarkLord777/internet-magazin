type EskizAuthResponse = { data: { token: string } };

const ESKIZ_BASE_URL = process.env.ESKIZ_BASE_URL || "https://notify.eskiz.uz";
const ESKIZ_EMAIL = process.env.ESKIZ_EMAIL || "";
const ESKIZ_PASSWORD = process.env.ESKIZ_PASSWORD || "";
const ESKIZ_SENDER = process.env.ESKIZ_SENDER || "4546";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function ensureCreds() {
  if (!ESKIZ_EMAIL || !ESKIZ_PASSWORD) {
    throw new Error("Eskiz credentials are not set");
  }
}

async function loginEskiz(): Promise<string> {
  ensureCreds();
  const form = new FormData();
  form.append("email", ESKIZ_EMAIL);
  form.append("password", ESKIZ_PASSWORD);
  console.log("[Eskiz Debug] Login attempt:", { email: ESKIZ_EMAIL, password: ESKIZ_PASSWORD });
  const res = await fetch(`${ESKIZ_BASE_URL}/api/auth/login`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  console.log("[Eskiz Debug] Response status:", res.status);
  const responseText = await res.text();
  console.log("[Eskiz Debug] Response body:", responseText);
  if (!res.ok) {
    throw new Error(`Eskiz login failed: ${res.status} ${responseText}`);
  }
  const json = JSON.parse(responseText) as EskizAuthResponse;
  console.log("[Eskiz Debug] Parsed response:", json);
  cachedToken = json?.data?.token || null;
  // Eskiz token aniq muddat bermasligi mumkin; 25 daqiqa deb kesh qilamiz
  tokenExpiresAt = Date.now() + 25 * 60 * 1000;
  return cachedToken!;
}

async function getEskizToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  return loginEskiz();
}

async function sendSmsOnce(token: string, phoneE164: string, message: string) {
  const form = new URLSearchParams();
  form.set("mobile_phone", phoneE164.replace(/^\+/, ""));
  form.set("message", message);
  form.set("from", ESKIZ_SENDER);
  const res = await fetch(`${ESKIZ_BASE_URL}/api/message/sms/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    cache: "no-store",
  });
  return res;
}

export async function sendSmsVerification(phoneE164: string, message: string): Promise<void> {
  ensureCreds();
  let token = await getEskizToken();
  let res = await sendSmsOnce(token, phoneE164, message);
  if (res.status === 401) {
    // token expired or invalid; refresh and retry once
    token = await loginEskiz();
    res = await sendSmsOnce(token, phoneE164, message);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Eskiz send failed: ${res.status} ${text}`);
  }
}


