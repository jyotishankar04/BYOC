import type { Request, Response, NextFunction } from "express";
import prisma from "@/config/db.config";
import { EmailQueueService } from "@/core/mail/mail.queue";
import { buildBroadcastEmail } from "@/core/mail/templates/broadcast";

export class AdminEmailsController {
  sendBroadcast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subject, previewText, body, audience = "all" } = req.body as {
        subject: string;
        previewText?: string;
        body: string;
        audience?: string;
      };
      const adminId = (req as Request & { userId?: string }).userId!;

      if (!subject?.trim() || !body?.trim()) {
        res.status(400).json({ error: "subject and body are required" });
        return;
      }

      const where =
        audience === "pro"
          ? { plan: "Pro" as const }
          : audience === "free"
            ? { plan: "Free" as const }
            : {};

      const users = await prisma.user.findMany({
        where,
        select: { email: true },
      });

      await prisma.emailBroadcast.create({
        data: {
          subject,
          previewText: previewText ?? null,
          body,
          audience,
          sentBy: adminId,
          recipientCount: users.length,
        },
      });

      const { html } = buildBroadcastEmail({ subject, previewText, body });
      for (const user of users) {
        EmailQueueService.enqueue({
          type: "broadcast",
          to: user.email,
          subject,
          previewText,
          html,
        });
      }

      res.json({ queued: users.length });
    } catch (err) {
      next(err);
    }
  };

  listBroadcasts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = 20;
      const skip = (page - 1) * limit;

      const [total, broadcasts] = await Promise.all([
        prisma.emailBroadcast.count(),
        prisma.emailBroadcast.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            admin: { select: { id: true, name: true, avatar: true } },
          },
        }),
      ]);

      res.json({
        total,
        page,
        totalPages: Math.ceil(total / limit),
        broadcasts,
      });
    } catch (err) {
      next(err);
    }
  };
}
