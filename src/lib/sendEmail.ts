import { sendAdminEmail } from "./adminGmail";
import { gmailSend } from "./gmail";
import { connectToDatabase } from "./db";
import { User } from "./user";

export async function sendVerificationEmail(to: string, text: string): Promise<void> {
  // Try admin Gmail first, fallback to user Gmail
  try {
    await sendAdminEmail(to, "Verification Code", text);
    return;
  } catch (adminError) {
    console.warn("[Email] Admin Gmail failed, trying user Gmail:", (adminError as Error).message);
  }

  await connectToDatabase();
  
  // Find a user with Gmail access to send from
  const sender = await User.findOne({ 
    "google.accessToken": { $exists: true },
    "google.tokenExpiresAt": { $gt: new Date() }
  });
  
  if (!sender?.google?.accessToken) {
    throw new Error("No Gmail sender available. Please configure ADMIN_GMAIL_* env vars or login with Google first.");
  }

  await gmailSend(sender.google.accessToken, sender.email, to, "Verification Code", text);
}

export async function sendAppEmail(params: { to: string; subject: string; text?: string; html?: string }): Promise<void> {
  const { to, subject, text, html } = params;
  
  // Try admin Gmail first, fallback to user Gmail
  try {
    await sendAdminEmail(to, subject, text || "", html);
    return;
  } catch (adminError) {
    console.warn("[Email] Admin Gmail failed, trying user Gmail:", (adminError as Error).message);
  }

  await connectToDatabase();
  
  // Find a user with Gmail access to send from
  const sender = await User.findOne({ 
    "google.accessToken": { $exists: true },
    "google.tokenExpiresAt": { $gt: new Date() }
  });
  
  if (!sender?.google?.accessToken) {
    throw new Error("No Gmail sender available. Please configure ADMIN_GMAIL_* env vars or login with Google first.");
  }

  await gmailSend(sender.google.accessToken, sender.email, to, subject, text || "", html);
}