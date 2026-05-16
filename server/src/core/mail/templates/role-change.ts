import { buildBase, infoRow, infoTable, paragraph } from "./base";

export interface RoleChangeTemplateData {
  memberName: string;
  workspaceName: string;
  newRole: string;
  changedByName: string;
}

export function buildRoleChangeHtml(data: RoleChangeTemplateData): string {
  const { memberName, workspaceName, newRole, changedByName } = data;

  const rows = [
    infoRow("Workspace", workspaceName),
    infoRow("New role", newRole),
    infoRow("Changed by", changedByName),
  ].join("");

  return buildBase({
    preheader: `Your role in ${workspaceName} has been updated to ${newRole}.`,
    title: "Your role has been updated",
    body: [
      paragraph(`Hi <strong>${memberName}</strong>, your role in <strong>${workspaceName}</strong> has been updated by <strong>${changedByName}</strong>.`),
      infoTable(rows),
      paragraph(`Your new permissions take effect immediately.`),
    ].join(""),
    note: "If you believe this was a mistake, please reach out to your workspace admin.",
  });
}

export function buildRoleChangeText(data: RoleChangeTemplateData): string {
  const { memberName, workspaceName, newRole, changedByName } = data;
  return `Hi ${memberName},\n\n${changedByName} has changed your role in ${workspaceName} to ${newRole}.\n\n– BringBucket`;
}
