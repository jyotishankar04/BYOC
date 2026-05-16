import { buildBase, alertBox, paragraph } from "./base";

export function buildSubscriptionPastDueEmail(data: {
  name: string;
  billingUrl: string;
}): { subject: string; html: string } {
  const { name, billingUrl } = data;

  return {
    subject: "Action required: payment failed — BringBucket",
    html: buildBase({
      preheader: "We couldn't process your payment. Please update your billing details to keep your subscription active.",
      title: "Payment failed",
      body: [
        paragraph(`Hi <strong>${name}</strong>, we were unable to process your payment for your BringBucket subscription.`),
        alertBox(
          `Please update your payment method as soon as possible. If left unresolved, your account may be downgraded to the Free plan.`,
          "danger",
        ),
        paragraph(`This can happen when a card expires, has insufficient funds, or your bank blocks the charge. Updating your payment details usually resolves it right away.`),
      ].join(""),
      cta: { label: "Update Payment Method →", url: billingUrl, color: "#d97706" },
      note: "If you continue to have issues, contact your bank or reach out to us for support.",
    }),
  };
}
