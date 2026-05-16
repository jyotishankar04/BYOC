import { buildBase, infoRow, infoTable, paragraph } from "./base";

export interface ShareLinkTemplateData {
  ownerName: string;
  sharerName: string;
  fileName: string;
  linkUrl: string;
}

export function buildShareLinkEmail(data: ShareLinkTemplateData): { subject: string; html: string } {
  const { ownerName, sharerName, fileName, linkUrl } = data;

  const rows = [
    infoRow("File", `<span style="word-break:break-all;">${fileName}</span>`),
    infoRow("Shared by", sharerName),
  ].join("");

  return {
    subject: `Your file "${fileName}" was shared`,
    html: buildBase({
      preheader: `${sharerName} created a share link for your file "${fileName}".`,
      title: "Your file was shared",
      body: [
        paragraph(`Hi <strong>${ownerName}</strong>, <strong>${sharerName}</strong> created a public share link for one of your files.`),
        infoTable(rows),
        paragraph(`You can manage or revoke this link from your workspace at any time.`),
      ].join(""),
      cta: { label: "View share link →", url: linkUrl },
      note: "If you didn't expect this, you can revoke the link from your workspace settings.",
    }),
  };
}
