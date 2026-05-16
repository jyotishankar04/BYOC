import { buildBase, infoRow, infoTable, paragraph } from "./base";

export function buildSubscriptionTrialStartedEmail(data: {
  name: string;
  plan: string;
  trialEnd: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const { name, plan, trialEnd, dashboardUrl } = data;

  const rows = [
    infoRow("Trial plan", plan),
    infoRow("Trial ends", trialEnd),
    infoRow("After trial", "Reverts to Free unless you add a payment method"),
  ].join("");

  return {
    subject: `Your ${plan} trial has started — BringBucket`,
    html: buildBase({
      preheader: `Your free ${plan} trial is live! Explore all premium features until ${trialEnd}.`,
      title: `Your ${plan} trial is live!`,
      body: [
        paragraph(`Hi <strong>${name}</strong>, your free trial of the <strong>${plan}</strong> plan has started. Every premium feature is fully unlocked — no restrictions, no commitment.`),
        infoTable(rows),
        paragraph(`Make the most of your trial by connecting your storage provider, inviting teammates, and exploring advanced sharing features.`),
      ].join(""),
      cta: { label: "Explore Features →", url: dashboardUrl },
      note: "No charge during the trial period. Add a payment method before the trial ends to keep premium features.",
    }),
  };
}
