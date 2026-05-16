import { Router } from "express";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

const router = Router();
const healthService = new HealthService();
const healthController = new HealthController(healthService);

router.get("/", healthController.check.bind(healthController));
router.get("/ready", healthController.ready.bind(healthController));

export default router;
