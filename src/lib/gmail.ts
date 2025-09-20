function buildRawEmail(from: string, to: string, subject: string, text: string, html?: string): string {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
  ];
  
  let body = '';
  if (html) {
    headers.push('Content-Type: multipart/alternative; boundary="boundary123"');
    body = `--boundary123\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${text}\r\n--boundary123\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n--boundary123--`;
  } else {
    headers.push('Content-Type: text/plain; charset=UTF-8');
    body = text;
  }
  
  const message = `${headers.join('\r\n')}\r\n\r\n${body}`;
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function gmailSend(accessToken: string, from: string, to: string, subject: string, text: string, html?: string): Promise<void> {
  const raw = buildRawEmail(from, to, subject, text, html);
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`gmail_send_failed:${res.status}:${text}`);
  }
}


