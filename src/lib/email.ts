// Server-only email utility. Never import this from a client component.

interface SendEmailOptions {
  to:       string;
  subject:  string;
  html:     string;
  text?:    string;
  from?:    string;
  replyTo?: string;
}

export interface EmailFallback {
  subject: string;
  text:    string;
  mailto:  string;
}

export interface EmailResult {
  sent:      boolean;
  fallback?: EmailFallback;
  error?:    string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromDefault =
    process.env.RESEND_FROM_EMAIL ?? "PortalFlow <noreply@portalflow.app>";

  if (!apiKey) {
    const text = opts.text ?? opts.subject;
    return {
      sent: false,
      fallback: {
        subject: opts.subject,
        text,
        mailto: `mailto:${opts.to}?subject=${encodeURIComponent(opts.subject)}&body=${encodeURIComponent(text)}`,
      },
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:     opts.from ?? fromDefault,
        to:       opts.to,
        subject:  opts.subject,
        html:     opts.html,
        text:     opts.text,
        reply_to: opts.replyTo,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { sent: false, error: body };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: (e as Error).message };
  }
}
