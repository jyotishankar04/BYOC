import { Router } from "express";
import { Webhooks } from "@polar-sh/express";
import env from "@/config/env";
import {
  handlePolarWebhookPayload,
  handleSubscriptionActive,
  handleSubscriptionCanceled,
  handleSubscriptionCreated,
  handleSubscriptionRevoked,
  handleSubscriptionUpdated,
  handleSubscriptionUncanceled,
} from "./polar-webhook.controller";

const polarWebhookRouter = Router();

polarWebhookRouter.post(
  "/polar",
  Webhooks({
    webhookSecret: env.POLAR_WEBHOOK_SECRET,
    onPayload: handlePolarWebhookPayload,
    onSubscriptionCreated: handleSubscriptionCreated,
    onSubscriptionActive: handleSubscriptionActive,
    onSubscriptionUpdated: handleSubscriptionUpdated,
    onSubscriptionCanceled: handleSubscriptionCanceled,
    onSubscriptionRevoked: handleSubscriptionRevoked,
    onSubscriptionUncanceled: handleSubscriptionUncanceled,
  }),
);

export default polarWebhookRouter;
