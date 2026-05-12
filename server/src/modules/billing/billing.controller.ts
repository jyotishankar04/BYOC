import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { UnauthorizedError } from "@/core/errors";
import prisma from "@/config/db.config";
import type { IBillingService } from "./billing.interface";

const checkoutSchema = z.object({
  productId: z.string().min(1),
});

const cancelSchema = z.object({
  revokeImmediately: z.boolean().optional().default(false),
});

export class BillingController {
  constructor(private billingService: IBillingService) {}

  listPlans = (_req: Request, res: Response): void => {
    res.json({ plans: this.billingService.listPlans() });
  };

  getMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const subscription = await this.billingService.getUserSubscription(
        req.userId!,
      );
      res.json({ subscription });
    } catch (err) {
      next(err);
    }
  };

  createCheckout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { productId } = checkoutSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { id: true, email: true, name: true },
      });
      if (!user) {
        throw new UnauthorizedError();
      }

      const result = await this.billingService.createCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        productId,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getPortal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.billingService.getCustomerPortalUrl(
        req.userId!,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  cancel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { revokeImmediately } = cancelSchema.parse(req.body ?? {});
      const subscription = await this.billingService.cancelSubscription(
        req.userId!,
        revokeImmediately,
      );
      res.json({ subscription });
    } catch (err) {
      next(err);
    }
  };
}
