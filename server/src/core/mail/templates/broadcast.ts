import { buildBase } from "./base";

export interface BroadcastTemplateData {
  subject: string;
  previewText?: string;
  body: string;
}

export function buildBroadcastEmail(data: BroadcastTemplateData): { subject: string; html: string } {
  const { subject, previewText, body } = data;

  const bodyHtml = body
    .split("\n\n")
    .map(
      (para) =>
        `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.75;font-family:Arial,Helvetica,sans-serif;">${para.replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  return {
    subject,
    html: buildBase({
      preheader: previewText,
      title: subject,
      body: bodyHtml,
    }),
  };
}
