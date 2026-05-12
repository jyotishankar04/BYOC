import { Router } from "express";
import { Checkout, CustomerPortal } from "@polar-sh/express";
import { requireAuth } from "@/modules/auth/auth.middleware";
import env from "@/config/env";
import prisma from "@/config/db.config";
import { BillingController } from "./billing.controller";
import { billingService } from "./billing.service";

const router = Router();
const controller = new BillingController(billingService);

router.get("/plans", controller.listPlans);

router.get("/me", requireAuth, controller.getMe);
router.post("/checkout", requireAuth, controller.createCheckout);
router.get("/portal", requireAuth, controller.getPortal);
router.post("/cancel", requireAuth, controller.cancel);

// Polar's hosted checkout — issues a 302 to a Polar-hosted checkout page.
// Frontend can link directly to `/api/v1/billing/polar-checkout?products=<id>&customerExternalId=<userId>`
router.get(
  "/polar-checkout",
  Checkout({
    accessToken: env.POLAR_ACCESS_TOKEN,
    successUrl: env.POLAR_SUCCESS_URL,
    returnUrl: env.POLAR_RETURN_URL,
    server: env.POLAR_SERVER,
    theme: "dark",
  }),
);

// Polar's customer portal — redirects an authenticated user to their portal.
router.get(
  "/polar-portal",
  requireAuth,
  CustomerPortal({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: env.POLAR_SERVER,
    returnUrl: env.POLAR_RETURN_URL,
    getCustomerId: async (req) => {
      const userId = req.userId;
      if (!userId) return "";
      const sub = await prisma.subscription.findUnique({
        where: { userId },
        select: { polarCustomerId: true },
      });
      return sub?.polarCustomerId ?? "";
    },
  }),
);

export default router;
