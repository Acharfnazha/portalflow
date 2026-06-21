// Email templates — returns { subject, html, text }

export function portalInviteTemplate(opts: {
  clientName: string;
  orgName:    string;
  portalUrl:  string;
}) {
  const { clientName, orgName, portalUrl } = opts;

  const subject = `${orgName} has shared your client portal`;

  const text = [
    `Hi ${clientName},`,
    ``,
    `${orgName} has set up a secure client portal for you.`,
    ``,
    `Access your portal here:`,
    portalUrl,
    ``,
    `Your portal gives you a real-time view of:`,
    `  • Projects and their progress`,
    `  • Shared documents`,
    `  • Invoices and payment status`,
    ``,
    `This link is unique to you — please don't share it.`,
    ``,
    `— ${orgName}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:560px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:18px;font-weight:700;color:#4f46e5;letter-spacing:-.3px;">
                ${orgName}
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:40px 40px 32px;">

              <!-- Icon -->
              <div style="width:52px;height:52px;border-radius:14px;background:#eef2ff;margin-bottom:24px;display:flex;align-items:center;justify-content:center;">
                <svg width="26" height="26" fill="none" stroke="#4f46e5" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>

              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-.4px;line-height:1.2;">
                Your client portal is ready
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                Hi ${clientName},<br/>
                <strong style="color:#0f172a;">${orgName}</strong> has set up a secure portal
                where you can track your projects, download documents, and view invoices.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#4f46e5;border-radius:10px;">
                    <a href="${portalUrl}"
                       style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;
                              color:#fff;text-decoration:none;letter-spacing:-.1px;">
                      Access your portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;">
                Or copy this link:<br/>
                <a href="${portalUrl}" style="color:#4f46e5;word-break:break-all;">${portalUrl}</a>
              </p>

              <!-- Features list -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#94a3b8;
                           text-transform:uppercase;letter-spacing:.06em;">
                  What you can view
                </p>
                ${[
                  ["Projects & progress", "#22c55e"],
                  ["Shared documents",    "#3b82f6"],
                  ["Invoices & payments", "#d97706"],
                ].map(([label, color]) => `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                  <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
                  <span style="font-size:13.5px;color:#334155;">${label}</span>
                </div>`).join("")}
              </div>

              <p style="margin:0;font-size:12.5px;color:#94a3b8;line-height:1.5;">
                🔒 This link is unique to you. Please don't share it with others.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Sent via <strong style="color:#64748b;">PortalFlow</strong> on behalf of ${orgName}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
