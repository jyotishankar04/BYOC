import { buildBase, infoRow, infoTable, paragraph } from "./base";

export interface LoginAlertTemplateData {
  name: string;
  ip?: string;
  timestamp: string;
}

export function buildLoginAlertEmail(data: LoginAlertTemplateData): { subject: string; html: string } {
  const { name, ip, timestamp } = data;

  const rows = [
    infoRow("Time", timestamp),
    ...(ip ? [infoRow("IP Address", ip)] : []),
    infoRow("Method", "Google OAuth"),
  ].join("");

  return {
    subject: "New sign-in to your BringBucket account",
    html: buildBase({
      preheader: "A new sign-in was detected on your BringBucket account.",
      title: "New sign-in detected",
      body: [
        paragraph(`Hi <strong>${name}</strong>, we noticed a new sign-in to your BringBucket account. Here are the details:`),
        infoTable(rows),
        paragraph(`If this was you, no action is needed.`),
        `<p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">If this wasn't you, please secure your Google account immediately — BringBucket uses Google OAuth for authentication.</p>`,
      ].join(""),
    }),
  };
}
