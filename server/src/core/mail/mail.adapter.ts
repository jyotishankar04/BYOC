import { Resend } from "resend";
import logger from "@/core/logger";
import env from "@/config/env";
import { transporter, mailOptions } from "./mail.config";

export interface MailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendMailViaAdapter(payload: MailPayload): Promise<void> {
  const { to, subject, html } = payload;

  if (env.MAIL_PROVIDER === "resend") {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    const resend = new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: mailOptions.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    logger.info({ to, subject, provider: "resend" }, "Email sent");
    return;
  }

  // smtp (MailHog or any SMTP)
  await transporter.sendMail({ ...mailOptions, to, subject, html });
  logger.info({ to, subject, provider: "smtp" }, "Email sent");
}
