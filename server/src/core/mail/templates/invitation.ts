import { buildBase, infoRow, infoTable, paragraph } from "./base";

export interface InvitationTemplateData {
  inviteeName: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  acceptUrl: string;
}

export function buildInvitationHtml(data: InvitationTemplateData): string {
  const { inviteeName, inviterName, workspaceName, role, acceptUrl } = data;

  const rows = [
    infoRow("Workspace", workspaceName),
    infoRow("Invited by", inviterName),
    infoRow("Your role", role),
  ].join("");

  return buildBase({
    preheader: `${inviterName} has invited you to join ${workspaceName} on BringBucket.`,
    title: `You're invited to ${workspaceName}`,
    body: [
      paragraph(`Hi <strong>${inviteeName}</strong>, <strong>${inviterName}</strong> has invited you to collaborate on their BringBucket workspace.`),
      infoTable(rows),
    ].join(""),
    cta: { label: "Accept Invitation", url: acceptUrl },
    note: "This invitation expires in 7 days. If you didn't expect this, you can safely ignore this email.",
  });
}

export function buildInvitationText(data: InvitationTemplateData): string {
  const { inviteeName, inviterName, workspaceName, role, acceptUrl } = data;
  return `Hi ${inviteeName},\n\n${inviterName} has invited you to join ${workspaceName} as ${role}.\n\nAccept the invitation: ${acceptUrl}\n\n– BringBucket`;
}
