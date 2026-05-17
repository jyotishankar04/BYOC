import { Router } from "express";
import { requireAuth } from "./auth.middleware";
import { authService } from "./auth.service";
import { AuthController } from "./auth.controller";

const router = Router();
export const authController = new AuthController(authService);

router.get("/ok", authController.healthCheck);

router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.get("/me", requireAuth, authController.getMe);

router.get("/api-keys", requireAuth, authController.listApiKeys);
router.post("/api-keys", requireAuth, authController.createApiKey);
router.delete("/api-keys/:keyId", requireAuth, authController.revokeApiKey);

export default router;
