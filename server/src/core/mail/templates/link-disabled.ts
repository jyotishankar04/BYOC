export interface LinkDisabledTemplateData {
  userName: string;
  workspaceName: string;
}

export function buildLinkDisabledHtml(data: LinkDisabledTemplateData): string {
  const { userName, workspaceName } = data;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <tr><td style="padding:32px 32px 0;text-align:center;">
      <h2 style="margin:0 0 8px;font-size:22px;color:#18181b;">Public sharing disabled for <strong>${workspaceName}</strong></h2>
      <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.5;">
        Your public share links in ${workspaceName} have been disabled because an admin turned off public sharing.
      </p>
    </td></tr>
    <tr><td style="padding:0 32px 32px;text-align:center;">
      <p style="margin:0;color:#a1a1aa;font-size:13px;">Hello ${userName}, any files shared via public links are no longer accessible.</p>
    </td></tr>
    <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
      <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">BYOC – Bring Your Own Cloud</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildLinkDisabledText(data: LinkDisabledTemplateData): string {
  const { userName, workspaceName } = data;
  return `Hi ${userName},

Your public share links in ${workspaceName} have been disabled because an admin turned off public sharing.

Any files shared via public links are no longer accessible.

– BYOC`;
}
