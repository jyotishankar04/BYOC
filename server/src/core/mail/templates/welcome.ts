import { buildBase, paragraph } from "./base";

export interface WelcomeTemplateData {
  name: string;
  getStartedUrl: string;
}

export function buildWelcomeEmail(data: WelcomeTemplateData): { subject: string; html: string } {
  const { name, getStartedUrl } = data;
  return {
    subject: "Welcome to BringBucket — let's connect your storage",
    html: buildBase({
      preheader: `Hi ${name}, your BringBucket account is ready. Connect your cloud storage and start managing files.`,
      title: `Welcome, ${name}!`,
      body: [
        paragraph(`Your <strong>BringBucket</strong> account is ready to go.`),
        paragraph(`Connect your own cloud storage bucket — AWS S3, Cloudflare R2, MinIO, Supabase, and more — and start managing files with zero vendor lock-in and full control over your data.`),
        paragraph(`It takes less than 2 minutes to get set up.`),
      ].join(""),
      cta: { label: "Connect your storage →", url: getStartedUrl },
      note: "Need help? Our setup guides walk you through every provider step by step.",
    }),
  };
}
