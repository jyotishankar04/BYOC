import { Worker } from "bullmq";
import logger from "@/core/logger";
import redisClient from "@/config/redis.config";
import env from "@/config/env";
import { sendMailViaAdapter } from "./mail.adapter";
import { emailQueue, type EmailJobPayload } from "./mail.queue";
import { buildWelcomeEmail } from "./templates/welcome";
import { buildLoginAlertEmail } from "./templates/login-alert";
import { buildShareLinkEmail } from "./templates/share-link";
import { buildInvitationHtml } from "./templates/invitation";
import { buildRoleChangeHtml } from "./templates/role-change";
import { buildLinkDisabledHtml } from "./templates/link-disabled";
import { buildSubscriptionActivatedEmail } from "./templates/subscription-activated";
import { buildSubscriptionCanceledEmail } from "./templates/subscription-canceled";
import { buildSubscriptionPastDueEmail } from "./templates/subscription-past-due";
import { buildSubscriptionTrialStartedEmail } from "./templates/subscription-trial-started";

async function processEmailJob(data: EmailJobPayload): Promise<void> {
  switch (data.type) {
    case "welcome": {
      const { subject, html } = buildWelcomeEmail({
        name: data.name,
        getStartedUrl: `${env.FRONTEND_URL}/onboard`,
      });
      await sendMailViaAdapter({ to: data.to, subject, html });
      break;
    }

    case "login_alert": {
      const { subject, html } = buildLoginAlertEmail({
        name: data.name,
        ip: data.ip,
        timestamp: new Date().toUTCString(),
      });
      await sendMailViaAdapter({ to: data.to, subject, html });
      break;
    }

    case "share_link_created": {
      const { subject, html } = buildShareLinkEmail({
        ownerName: data.ownerName,
        sharerName: data.sharerName,
        fileName: data.fileName,
        linkUrl: data.linkUrl,
      });
      await sendMailViaAdapter({ to: data.to, subject, html });
      break;
    }

    case "invitation": {
      const html = buildInvitationHtml({
        inviteeName: data.inviteeName,
        inviterName: data.inviterName,
        workspaceName: data.workspaceName,
        role: data.role,
        acceptUrl: data.inviteLink,
      });
      await sendMailViaAdapter({
        to: data.to,
        subject: `You're invited to ${data.workspaceName}`,
        html,
      });
      break;
    }

    case "role_change": {
      const html = buildRoleChangeHtml({
        memberName: data.memberName,
        workspaceName: data.workspaceName,
        newRole: data.newRole,
        changedByName: data.changedByName,
      });
      await sendMailViaAdapter({
        to: data.to,
        subject: `Role updated in ${data.workspaceName}`,
        html,
      });
      break;
    }

    case "link_disabled": {
      const html = buildLinkDisabledHtml({
        userName: data.userName,
        workspaceName: data.workspaceName,
      });
      await sendMailViaAdapter({
        to: data.to,
        subject: `Public sharing disabled for ${data.workspaceName}`,
        html,
      });
      break;
    }

    case "broadcast": {
      await sendMailViaAdapter({ to: data.to, subject: data.subject, html: data.html });
      break;
    }

    case "subscription_activated": {
      const { subject, html } = buildSubscriptionActivatedEmail({
        name: data.name,
        plan: data.plan,
        dashboardUrl: data.dashboardUrl,
      });
      await sendMailViaAdapter({ to: data.to, subject, html });
      break;
    }

    case "subscription_canceled": {
      const { subject, html } = buildSubscriptionCanceledEmail({
        name: data.name,
        plan: data.plan,
        periodEnd: data.periodEnd,
      });
      await sendMailViaAdapter({ to: data.to, subject, html });
      break;
    }

    case "subscription_past_due": {
      const { subject, html } = buildSubscriptionPastDueEmail({
        name: data.name,
        billingUrl: data.billingUrl,
      });
      await sendMailViaAdapter({ to: data.to, subject, html });
      break;
    }

    case "subscription_trial_started": {
      const { subject, html } = buildSubscriptionTrialStartedEmail({
        name: data.name,
        plan: data.plan,
        trialEnd: data.trialEnd,
        dashboardUrl: data.dashboardUrl,
      });
      await sendMailViaAdapter({ to: data.to, subject, html });
      break;
    }
  }
}

export function startEmailWorker(): void {
  const worker = new Worker<EmailJobPayload>(
    emailQueue.name,
    async (job) => {
      await processEmailJob(job.data);
    },
    {
      connection: redisClient,
      concurrency: 5,
    },
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, type: job.data.type }, "Email job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, type: job?.data?.type, err }, "Email job failed");
  });

  logger.info("Email worker started");
}
