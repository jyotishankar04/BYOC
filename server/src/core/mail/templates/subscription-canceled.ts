import { buildBase, alertBox, infoRow, infoTable, paragraph } from "./base";

export function buildSubscriptionCanceledEmail(data: {
  name: string;
  plan: string;
  periodEnd: string;
}): { subject: string; html: string } {
  const { name, plan, periodEnd } = data;

  const rows = [
    infoRow("Plan", plan),
    infoRow("Access until", periodEnd),
    infoRow("After that", "Reverts to Free plan"),
  ].join("");

  return {
    subject: `Your ${plan} subscription has been canceled — BringBucket`,
    html: buildBase({
      preheader: `Your ${plan} subscription has been canceled. Your access continues until ${periodEnd}.`,
      title: "Subscription canceled",
      body: [
        paragraph(`Hi <strong>${name}</strong>, we've processed your cancellation request for the <strong>${plan}</strong> plan.`),
        infoTable(rows),
        alertBox(`Your premium access remains active until <strong>${periodEnd}</strong>. After that, your account reverts to the Free plan automatically.`, "warning"),
        paragraph(`Changed your mind? You can resubscribe at any time — no data will be lost.`),
      ].join(""),
      cta: { label: "Resubscribe", url: "https://bringbucket.com/app/billing" },
      note: "No further charges will be made. We're sorry to see you go.",
    }),
  };
}
