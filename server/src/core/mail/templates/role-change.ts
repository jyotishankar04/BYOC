export interface RoleChangeTemplateData {
  memberName: string;
  workspaceName: string;
  newRole: string;
  changedByName: string;
}

export function buildRoleChangeHtml(data: RoleChangeTemplateData): string {
  const { memberName, workspaceName, newRole, changedByName } = data;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <tr><td style="padding:32px 32px 0;text-align:center;">
      <h2 style="margin:0 0 8px;font-size:22px;color:#18181b;">Role updated in <strong>${workspaceName}</strong></h2>
      <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.5;">
        Your role has been changed to <strong>${newRole}</strong> by <strong>${changedByName}</strong>.
      </p>
    </td></tr>
    <tr><td style="padding:0 32px 32px;text-align:center;">
      <p style="margin:0;color:#a1a1aa;font-size:13px;">Hello ${memberName}, you now have ${newRole} permissions in ${workspaceName}.</p>
    </td></tr>
    <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
      <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">BYOC – Bring Your Own Cloud</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildRoleChangeText(data: RoleChangeTemplateData): string {
  const { memberName, workspaceName, newRole, changedByName } = data;
  return `Hi ${memberName},

${changedByName} has changed your role in ${workspaceName} to ${newRole}.

– BYOC`;
}
