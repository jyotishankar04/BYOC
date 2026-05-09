import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import prisma from "@/config/db.config";
import redis from "@/config/redis.config";
import { WorkspaceType } from "@/generated/prisma/client";
import { requireAuth } from "./auth.middleware";
import { ProviderService } from "@/modules/provider/provider.service";
import { connectProviderSchema } from "@/modules/provider/provider.schema";
import { AppError } from "@/core/errors";
import { SubscriptionSnapshotService } from "@/modules/billing/subscription-snapshot.service";
import { assertProviderAccess } from "@/modules/billing/subscription-access";

const onboardRouter = Router();
const providerService = new ProviderService(prisma);

onboardRouter.use(requireAuth);

// POST /api/v1/onboard/provider
// Connects a storage provider to the caller's personal workspace and marks
// the user as onboarded. Safe to call multiple times (idempotent for the
// provider upsert; sets onboarded = true each time).
onboardRouter.post(
  "/provider",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = connectProviderSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const userId = req.userId!;

      // Find the user's personal workspace (first workspace they own)
      const workspace = await prisma.workspace.findFirst({
        where: { ownerId: userId, type: WorkspaceType.PERSONAL },
        orderBy: { createdAt: "asc" },
      });
      if (!workspace) {
        throw new AppError(
          "No personal workspace found. Please complete signup first.",
          404,
          "WORKSPACE_NOT_FOUND",
        );
      }

      const snapshot = await new SubscriptionSnapshotService(
        prisma,
      ).getWorkspaceSnapshot(workspace.id);
      assertProviderAccess(snapshot.plan, parsed.data.providerType);

      const provider = await providerService.connectProvider(
        workspace.id,
        parsed.data,
      );

      // Mark user as onboarded via direct Prisma update
      await prisma.user.update({
        where: { id: userId },
        data: { onboarded: true },
      });

      // Patch the Redis session blob in-place (same format as before).
      // Sessions live primarily in Redis. Deleting the key would log the user out.
      // We must update onboarded=true in the cached { session, user } blob
      // and write it back with the remaining TTL.
      if (req.sessionToken) {
        const raw = await redis.get(req.sessionToken);
        if (raw) {
          const ttl = await redis.ttl(req.sessionToken);
          const cached = JSON.parse(raw) as {
            session: unknown;
            user: Record<string, unknown>;
          };
          cached.user.onboarded = true;
          const serialized = JSON.stringify(cached);
          if (ttl > 0) {
            await redis.set(req.sessionToken, serialized, "EX", ttl);
          } else {
            await redis.set(req.sessionToken, serialized);
          }
        }
      }

      res.status(201).json({ provider, workspaceId: workspace.id });
    } catch (err) {
      next(err);
    }
  },
);

export default onboardRouter;
