import { createHmac, timingSafeEqual } from "node:crypto";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import mime from "mime-types";
import prisma from "@/config/db.config";
import env from "@/config/env";
import { FileKind } from "@/generated/prisma/client";
import logger from "@/core/logger";

const webhookRouter = Router();

function inferKind(mimeType: string): FileKind {
  if (mimeType.startsWith("image/")) return FileKind.image;
  if (mimeType.startsWith("video/")) return FileKind.video;
  if (mimeType.startsWith("audio/")) return FileKind.audio;
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  )
    return FileKind.document;
  if (
    [
      "application/zip",
      "application/x-tar",
      "application/gzip",
      "application/x-bzip2",
      "application/x-7z-compressed",
      "application/x-rar-compressed",
    ].includes(mimeType)
  )
    return FileKind.archive;
  return FileKind.other;
}

function verifySignature(body: string, signature: string): boolean {
  const expected = createHmac("sha256", env.WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("hex");
  const sigValue = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sigValue, "hex"));
  } catch {
    return false;
  }
}

// POST /api/v1/webhooks/s3
// Public endpoint — authenticated via X-Webhook-Signature header (HMAC-SHA256)
webhookRouter.post(
  "/s3",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawBody = JSON.stringify(req.body);
      const sig = req.headers["x-webhook-signature"] as string | undefined;

      // Accept AWS SNS subscription confirmations without signature check
      const snsType = req.headers["x-amz-sns-message-type"] as string | undefined;
      if (snsType === "SubscriptionConfirmation") {
        logger.info({ url: req.body.SubscribeURL }, "SNS subscription confirmation received");
        return res.status(200).json({ message: "ok" });
      }

      if (sig && !verifySignature(rawBody, sig)) {
        return res.status(401).json({ error: { code: "INVALID_SIGNATURE", message: "Invalid webhook signature" } });
      }

      // Unwrap SNS notification wrapper if present
      let payload = req.body;
      if (snsType === "Notification" && typeof payload.Message === "string") {
        payload = JSON.parse(payload.Message);
      }

      const records: Array<{ eventName?: string; s3?: { bucket: { name: string }; object: { key: string; size?: number } } }> =
        payload.Records ?? [];

      for (const record of records) {
        const eventName = record.eventName ?? "";
        const bucketName = record.s3?.bucket.name;
        const rawKey = record.s3?.object.key;
        if (!bucketName || !rawKey) continue;

        const key = decodeURIComponent(rawKey.replace(/\+/g, " "));

        const provider = await prisma.storageProvider.findFirst({
          where: { bucket: bucketName },
          include: { workspace: { select: { ownerId: true } } },
        });
        if (!provider) continue;

        const workspaceId = provider.workspaceId;

        if (eventName.startsWith("ObjectCreated")) {
          const fileName = key.split("/").pop() ?? key;
          const mimeType =
            (mime.lookup(fileName) as string | false) || "application/octet-stream";
          const extension = fileName.includes(".") ? fileName.split(".").pop()! : undefined;
          const size = record.s3?.object.size ?? 0;

          await prisma.file.upsert({
            where: { workspaceId_storagePath: { workspaceId, storagePath: key } },
            create: {
              id: randomUUID(),
              workspaceId,
              name: fileName,
              extension: extension ?? null,
              storagePath: key,
              size,
              mimeType,
              kind: inferKind(mimeType),
              status: "uploaded",
              source: "s3_import",
              uploadedById: provider.workspace.ownerId,
            },
            update: { status: "uploaded", size },
          });

          logger.info({ workspaceId, key }, "Webhook: ObjectCreated");
        } else if (eventName.startsWith("ObjectRemoved")) {
          await prisma.file.updateMany({
            where: { workspaceId, storagePath: key },
            data: { status: "deleted" },
          });
          logger.info({ workspaceId, key }, "Webhook: ObjectRemoved");
        }
      }

      res.status(200).json({ message: "ok" });
    } catch (err) {
      next(err);
    }
  },
);

export default webhookRouter;
