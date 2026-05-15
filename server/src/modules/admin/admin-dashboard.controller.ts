import type { Request, Response, NextFunction } from "express";
import prisma from "@/config/db.config";

export class AdminDashboardController {
  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        newUsersThisWeek,
        totalWorkspaces,
        totalFiles,
        totalShareLinks,
        activeSubscriptions,
        totalBlogs,
        publishedBlogs,
        recentActivity,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.workspace.count(),
        prisma.file.count({ where: { status: "uploaded" } }),
        prisma.shareLink.count({ where: { status: "Active" } }),
        prisma.subscription.count({ where: { status: { in: ["Active", "Trialing"] } } }),
        prisma.blog.count(),
        prisma.blog.count({ where: { published: true } }),
        prisma.activityLog.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        }),
      ]);

      res.json({
        stats: {
          totalUsers,
          newUsersThisWeek,
          totalWorkspaces,
          totalFiles,
          totalShareLinks,
          activeSubscriptions,
          totalBlogs,
          publishedBlogs,
        },
        recentActivity,
      });
    } catch (err) {
      next(err);
    }
  };
}
