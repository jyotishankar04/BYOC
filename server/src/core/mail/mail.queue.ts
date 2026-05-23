import { Queue } from "bullmq";
import redisClient from "@/config/redis.config";
import logger from "@/core/logger";

export type EmailJobPayload =
  | { type: "welcome"; to: string; name: string }
  | { type: "login_alert"; to: string; name: string; ip?: string }
  | { type: "share_link_created"; to: string; ownerName: string; sharerName: string; fileName: string; linkUrl: string }
  | { type: "invitation"; to: string; inviteeName: string; inviterName: string; workspaceName: string; role: string; inviteLink: string }
  | { type: "role_change"; to: string; memberName: string; workspaceName: string; newRole: string; changedByName: string }
  | { type: "link_disabled"; to: string; userName: string; workspaceName: string }
  // Broadcast
  | { type: "broadcast"; to: string; subject: string; previewText?: string; html: string }
  // Billing
  | { type: "subscription_activated"; to: string; name: string; plan: string; dashboardUrl: string }
  | { type: "subscription_canceled"; to: string; name: string; plan: string; periodEnd: string }
  | { type: "subscription_past_due"; to: string; name: string; billingUrl: string }
  | { type: "subscription_trial_started"; to: string; name: string; plan: string; trialEnd: string; dashboardUrl: string };

export const emailQueue = new Queue<EmailJobPayload>("email", {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const EmailQueueService = {
  enqueue(payload: EmailJobPayload): void {
    emailQueue.add(payload.type, payload).catch((err) => {
      logger.error({ err }, "EmailQueue failed to enqueue job");
    });
  },
};
