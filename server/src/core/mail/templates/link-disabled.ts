import { buildBase, alertBox, paragraph } from "./base";

export interface LinkDisabledTemplateData {
  userName: string;
  workspaceName: string;
}

export function buildLinkDisabledHtml(data: LinkDisabledTemplateData): string {
  const { userName, workspaceName } = data;

  return buildBase({
    preheader: `Public sharing has been disabled for ${workspaceName}. Your share links are now inactive.`,
    title: "Public sharing disabled",
    body: [
      paragraph(`Hi <strong>${userName}</strong>, an admin of <strong>${workspaceName}</strong> has turned off public sharing for the workspace.`),
      alertBox(`All your public share links in <strong>${workspaceName}</strong> are now inactive and no longer accessible by recipients.`, "danger"),
      paragraph(`Private and password-protected links are not affected. Contact your workspace admin if you have any questions.`),
    ].join(""),
  });
}

export function buildLinkDisabledText(data: LinkDisabledTemplateData): string {
  const { userName, workspaceName } = data;
  return `Hi ${userName},\n\nPublic sharing has been disabled for ${workspaceName}. Your public share links are no longer accessible.\n\n– BringBucket`;
}
