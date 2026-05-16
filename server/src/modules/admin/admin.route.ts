import { Router } from "express";
import { requireAdmin } from "./admin.middleware";
import { AdminDashboardController } from "./admin-dashboard.controller";
import { AdminUsersController } from "./admin-users.controller";
import { AdminWorkspacesController } from "./admin-workspaces.controller";
import { AdminSubscriptionsController } from "./admin-subscriptions.controller";
import { AdminBlogsController, PublicBlogsController } from "./admin-blogs.controller";
import { AdminActivityController } from "./admin-activity.controller";
import { AdminSettingsController, PublicConfigController } from "./admin-settings.controller";
import { AdminEmailsController } from "./admin-emails.controller";

const router = Router();
export const publicBlogRouter = Router();
export const publicConfigRouter = Router();

const dashboard = new AdminDashboardController();
const users = new AdminUsersController();
const workspaces = new AdminWorkspacesController();
const subscriptions = new AdminSubscriptionsController();
const blogs = new AdminBlogsController();
const publicBlogs = new PublicBlogsController();
const activity = new AdminActivityController();
const settings = new AdminSettingsController();
const publicConfig = new PublicConfigController();
const emails = new AdminEmailsController();

// ─── Admin routes (require admin auth) ───────────────────────────────────────

router.get("/stats", requireAdmin, dashboard.getStats);

router.get("/users", requireAdmin, users.list);
router.get("/users/:userId", requireAdmin, users.getOne);
router.patch("/users/:userId", requireAdmin, users.update);
router.delete("/users/:userId", requireAdmin, users.remove);

router.get("/workspaces", requireAdmin, workspaces.list);
router.get("/workspaces/:workspaceId", requireAdmin, workspaces.getOne);
router.delete("/workspaces/:workspaceId", requireAdmin, workspaces.remove);

router.get("/subscriptions", requireAdmin, subscriptions.list);
router.patch("/subscriptions/:subscriptionId", requireAdmin, subscriptions.update);

router.get("/activity", requireAdmin, activity.list);

router.get("/settings", requireAdmin, settings.getSettings);
router.patch("/settings", requireAdmin, settings.updateSettings);

router.get("/blogs", requireAdmin, blogs.list);
router.post("/blogs", requireAdmin, blogs.create);
router.get("/blogs/:blogId", requireAdmin, blogs.getOne);
router.patch("/blogs/:blogId", requireAdmin, blogs.update);
router.delete("/blogs/:blogId", requireAdmin, blogs.remove);

router.post("/emails/broadcast", requireAdmin, emails.sendBroadcast);
router.get("/emails/broadcasts", requireAdmin, emails.listBroadcasts);

// ─── Public routes (no auth) ──────────────────────────────────────────────────

publicBlogRouter.get("/", publicBlogs.list);
publicBlogRouter.get("/tags", publicBlogs.tags);
publicBlogRouter.get("/:slug", publicBlogs.getBySlug);

publicConfigRouter.get("/", publicConfig.getConfig);

export default router;
