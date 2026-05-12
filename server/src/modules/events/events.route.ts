import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { requireWorkspaceMember } from "@/shared/middleware/workspace.middleware";
import { EventsController } from "./events.controller";

const eventsRouter = Router({ mergeParams: true });
const eventsController = new EventsController();

eventsRouter.use(requireAuth);

eventsRouter.get(
  "/",
  requireWorkspaceMember,
  eventsController.subscribe,
);

export default eventsRouter;
