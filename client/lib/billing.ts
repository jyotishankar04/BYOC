"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import type { WorkspacePlan } from "./billing-constraints";

export type BillingCycle = "monthly" | "semiannual";
export type PaidWorkspacePlan = Exclude<WorkspacePlan, "Free">;

export interface BillingStatus {
  plan: WorkspacePlan;
  subscriptionId: string | null;
  status: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  billingCycle: BillingCycle | null;
  productId: string | null;
  isTrialing: boolean;
  trialEligible: boolean;
  isActive: boolean;
}

export interface BillingPlan {
  id: string;
  plan: PaidWorkspacePlan;
  billingCycle: BillingCycle;
  name: string;
  priceAmount: number;
  currency: "USD";
  intervalLabel: string;
  productId: string;
  configured: boolean;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

export interface ChangePlanResponse {
  success: true;
}

export const billingKeys = {
  plans: ["billing", "plans"] as const,
  status: ["billing", "status"] as const,
};

export function useBillingPlans() {
  return useQuery<BillingPlan[]>({
    queryKey: billingKeys.plans,
    queryFn: async () => {
      const res = await api.get<{ plans: BillingPlan[] }>("/api/v1/billing/plans");
      return res.data.plans;
    },
  });
}

export function useBillingStatus() {
  return useQuery<BillingStatus>({
    queryKey: billingKeys.status,
    queryFn: async () => {
      const res = await api.get<BillingStatus>("/api/v1/billing/status");
      return res.data;
    },
  });
}

export function useCreateCheckout() {
  return useMutation<
    CheckoutResponse,
    Error,
    { plan: PaidWorkspacePlan ; billingCycle: BillingCycle ; trial?: boolean }
  >({
    mutationFn: async (data) => {
      const res = await api.post<CheckoutResponse>("/api/v1/billing/checkout", data);
      return res.data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });
}

export function useCreatePortalUrl() {
  return useMutation<PortalResponse, Error, void>({
    mutationFn: async () => {
      const res = await api.post<PortalResponse>("/api/v1/billing/portal");
      return res.data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to open customer portal");
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation<
    ChangePlanResponse,
    Error,
    { plan: PaidWorkspacePlan ; billingCycle: BillingCycle }
  >({
    mutationFn: async (data) => {
      const res = await api.post<ChangePlanResponse>("/api/v1/billing/change-plan", data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.status });
      toast.success("Plan updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update plan");
    },
  });
}
