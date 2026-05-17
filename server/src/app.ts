import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import type { Express } from "express";
import { requestLogger } from "@/shared/middleware/request-logger";
import { errorHandler } from "@/shared/middleware/error-handler";
import { maintenanceModeMiddleware } from "@/shared/middleware/maintenance.middleware";
import { shareLinkPasswordLimiter } from "@/config/rate-limiters";
import healthRoutes from "@/modules/health/health.routes";
import authRoutes, { authController } from "@/modules/auth/auth.route";
import workspaceRoutes from "@/modules/workspace/workspace.route";
import userRoutes from "@/modules/user/user.route";
import onboardRoutes from "@/modules/auth/onboard.route";
import webhookRoutes from "@/modules/webhooks/s3-webhook.route";
import polarWebhookRoutes from "@/modules/webhooks/polar/polar-webhook.route";
import billingRoutes from "@/modules/billing/billing.route";
import adminRoutes, {
  publicBlogRouter,
  publicConfigRouter,
} from "@/modules/admin/admin.route";
import notificationsRoutes from "@/modules/notifications/notifications.route";
import activityRoutes from "@/modules/activity/activity.route";
import shareLinksRoutes, {
  publicShareRouter,
} from "@/modules/share-links/share-links.route";
import analyticsRoutes from "@/modules/analytics/analytics.route";
import { startCronJobs } from "@/jobs/jobs";
import env from "@/config/env";

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(compression());

app.use(maintenanceModeMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Public Share Links (no auth) — rate limited to guard password brute-force
app.use("/s", shareLinkPasswordLimiter, publicShareRouter);

// Public Blogs (no auth)
app.use("/api/v1/blogs", publicBlogRouter);

// Public app config (no auth)
app.use("/api/v1/config", publicConfigRouter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/onboard", onboardRoutes);
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/v1/webhooks", polarWebhookRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users/me/notifications", notificationsRoutes);
app.use("/api/v1/workspaces/:workspaceId/activity", activityRoutes);
app.use("/api/v1/workspaces/:workspaceId/share-links", shareLinksRoutes);
app.use("/api/v1/workspaces/:workspaceId", analyticsRoutes);
app.use("/health", healthRoutes);

// Google OAuth callback — must match URI registered in Google Cloud Console
app.get("/api/auth/callback/google", authController.googleCallback);

app.use(errorHandler);

startCronJobs();

export default app;
