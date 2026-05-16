import { buildBase, infoRow, infoTable, paragraph, statusBadge } from "./base";

export function buildSubscriptionActivatedEmail(data: {
  name: string;
  plan: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const { name, plan, dashboardUrl } = data;

  const rows = [
    infoRow("Plan", `${plan} &nbsp;${statusBadge("Active", "#166534", "#dcfce7")}`),
    infoRow("Status", "Subscription active"),
  ].join("");

  return {
    subject: `You're now on ${plan} — BringBucket`,
    html: buildBase({
      preheader: `Your ${plan} subscription is now active. Welcome to premium!`,
      title: `You're on ${plan}!`,
      body: [
        paragraph(`Hi <strong>${name}</strong>, your <strong>${plan}</strong> subscription is now active. All premium features are unlocked.`),
        infoTable(rows),
        paragraph(`Thank you for supporting BringBucket. We're excited to have you on ${plan}.`),
      ].join(""),
      cta: { label: "Go to Dashboard →", url: dashboardUrl },
      note: "Questions? Reply to this email and we'll be happy to help.",
    }),
  };
}
