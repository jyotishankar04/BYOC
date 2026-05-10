import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import prisma from "@/config/db.config";

const router = Router();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.use(requireAuth);

router.get("/me", userController.getProfile);
router.patch("/me", userController.updateProfile);
router.get("/me/accounts", userController.listAccounts);
router.get("/me/sessions", userController.listSessions);
router.delete("/me/sessions/others", userController.revokeOtherSessions);
router.delete("/me/sessions/:sessionId", userController.revokeSession);
router.get("/preferences", userController.getPreferences);
router.patch("/preferences", userController.updatePreferences);
router.get("/me/invites", userController.listMyInvites);

export default router;
