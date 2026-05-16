// Logo URLs
const LOGO_DARK_BG =
  "https://res.cloudinary.com/djby1yfko/image/upload/v1778845963/bringbucket-dark_mwcyqk.png"; // white wordmark — for dark header
const LOGO_LIGHT_BG =
  "https://res.cloudinary.com/djby1yfko/image/upload/v1778845963/bringbucket_g53e61.png"; // dark wordmark — for white/gray areas
const LOGO_ICON =
  "https://res.cloudinary.com/djby1yfko/image/upload/v1778845964/bringbutket-logo_qyebxs.png"; // icon only

const BRAND_INDIGO = "#6366f1";
const HEADER_BG = "#09090b";

// ─── Primitive helpers ────────────────────────────────────────────────────────

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.75;font-family:Arial,Helvetica,sans-serif;">${html}</p>`;
}

export function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;width:110px;">
            ${label}
          </td>
          <td style="font-size:14px;color:#111827;font-weight:600;">
            ${value}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function infoTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="margin:0 0 20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#f9fafb;">
    <tbody>
      ${rows}
    </tbody>
  </table>`;
}

export function alertBox(html: string, type: "info" | "warning" | "danger" = "info"): string {
  const map = {
    info:    { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", icon: "ℹ" },
    warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e", icon: "⚠" },
    danger:  { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", icon: "✕" },
  };
  const s = map[type];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="margin:0 0 20px;border:1px solid ${s.border};border-radius:8px;overflow:hidden;background:${s.bg};">
    <tr>
      <td style="padding:14px 18px;font-size:14px;color:${s.text};line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
        <strong>${s.icon}&nbsp;&nbsp;</strong>${html}
      </td>
    </tr>
  </table>`;
}

export function statusBadge(label: string, color: string, bg: string): string {
  return `<span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${bg};color:${color};letter-spacing:0.03em;">${label}</span>`;
}

// ─── Button ───────────────────────────────────────────────────────────────────

function ctaButton(label: string, url: string, color = BRAND_INDIGO): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
    <tr>
      <td style="background:${color};border-radius:6px;">
        <a href="${url}"
          style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

// ─── Core wrapper ─────────────────────────────────────────────────────────────

export interface EmailBaseOptions {
  /** Short text shown in inbox preview (hidden in email body). */
  preheader?: string;
  /** Big headline rendered inside the dark header. */
  title: string;
  /** HTML content for the white body section. */
  body: string;
  /** Optional primary CTA. */
  cta?: { label: string; url: string; color?: string };
  /** Optional small muted note at bottom of body. */
  note?: string;
}

export function buildBase(opts: EmailBaseOptions): string {
  const { preheader, title, body, cta, note } = opts;

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">
        ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
      </div>`
    : "";

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    img { -ms-interpolation-mode: bicubic; }
    #outlook a { padding: 0; }
    table { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body, p, a, li, td { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    a[href^="tel"], a[href^="sms"] { color: inherit; cursor: default; text-decoration: none; }

    @media only screen and (max-width: 620px) {
      table#bodyTable { width: 100% !important; }
      td.cardWrap { padding: 0 !important; border-radius: 0 !important; }
      td.bodyPad { padding: 24px 20px !important; }
      td.headerPad { padding: 20px 20px 0 !important; }
      td.titlePad { padding: 16px 20px 24px !important; }
      td.footerPad { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  ${preheaderHtml}

  <!--[if mso]><center><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
  <table id="bodyTable" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding:40px 16px;" align="center">

        <!-- ── Card ── -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.10);">

          <!-- ── HEADER: dark bg ── -->
          <tr>
            <td class="headerPad"
              style="background:${HEADER_BG};padding:26px 40px 0;">
              <!-- Logo -->
              <a href="https://bringbucket.com" style="display:inline-block;line-height:1;">
                <img src="${LOGO_DARK_BG}" alt="BringBucket" height="30"
                  style="height:30px;width:auto;display:block;border:0;">
              </a>
            </td>
          </tr>

          <!-- Divider inside header -->
          <tr>
            <td style="background:${HEADER_BG};padding:18px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-bottom:1px solid rgba(255,255,255,0.12);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title inside header -->
          <tr>
            <td class="titlePad"
              style="background:${HEADER_BG};padding:22px 40px 30px;text-align:left;">
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:900;color:#a5b4fc;line-height:1.35;letter-spacing:-0.3px;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- ── BODY: white ── -->
          <tr>
            <td class="bodyPad"
              style="background:#ffffff;padding:32px 40px 0;">
              ${body}
              ${cta ? ctaButton(cta.label, cta.url, cta.color) : ""}
              ${note
                ? `<p style="margin:20px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${note}</p>`
                : ""}
            </td>
          </tr>

          <!-- Bottom spacer in body -->
          <tr>
            <td style="background:#ffffff;height:36px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td class="footerPad"
              style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:28px 40px;" align="center">

              <!-- Footer logo (light-bg version) -->
              <a href="https://bringbucket.com" style="display:inline-block;margin-bottom:16px;">
                <img src="${LOGO_ICON}" alt="BringBucket" height="28"
                  style="height:28px;width:auto;display:block;margin:0 auto;border:0;">
              </a>

              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;line-height:1.6;">
                BringBucket &mdash; Bring Your Own Cloud
              </p>
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#cbd5e1;line-height:1.6;">
                You're receiving this because you have an account with us.
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;">
                <a href="https://bringbucket.com/unsubscribe"
                  style="color:#6366f1;text-decoration:none;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="https://bringbucket.com/privacy"
                  style="color:#6366f1;text-decoration:none;">Privacy Policy</a>
              </p>

            </td>
          </tr>

        </table>
        <!-- ── /Card ── -->

      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table></center><![endif]-->
</body>
</html>`;
}
