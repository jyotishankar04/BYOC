export interface InvitationTemplateData {
  inviteeName: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  acceptUrl: string;
}

export function buildInvitationHtml(data: InvitationTemplateData): string {
  const { inviteeName, inviterName, workspaceName, role, acceptUrl } = data;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <tr><td style="padding:32px 32px 0;text-align:center;">
      <h2 style="margin:0 0 8px;font-size:22px;color:#18181b;">You're invited to <strong>${workspaceName}</strong></h2>
      <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.5;">
        <strong>${inviterName}</strong> has invited you to join as <strong>${role}</strong>.
      </p>
    </td></tr>
    <tr><td style="padding:0 32px 32px;text-align:center;">
      <a href="${acceptUrl}" style="display:inline-block;padding:12px 32px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">Accept Invitation</a>
      <p style="margin:16px 0 0;color:#a1a1aa;font-size:13px;">Hello ${inviteeName}, you've been invited to collaborate on ${workspaceName}.</p>
    </td></tr>
    <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
      <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">BYOC – Bring Your Own Cloud</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildInvitationText(data: InvitationTemplateData): string {
  const { inviteeName, inviterName, workspaceName, role, acceptUrl } = data;
  return `Hi ${inviteeName},

${inviterName} has invited you to join ${workspaceName} as ${role}.

Accept the invitation: ${acceptUrl}

– BYOC`;
}
