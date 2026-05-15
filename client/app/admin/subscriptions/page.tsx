"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminSubscriptions } from "@/lib/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "canceled", label: "Canceled" },
  { value: "past_due", label: "Past due" },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600",
    trialing: "bg-blue-500/10 text-blue-600",
    canceled: "bg-red-500/10 text-red-600",
    past_due: "bg-amber-500/10 text-amber-600",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useAdminSubscriptions({ page, status: status === "all" ? undefined : status });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{data?.total ?? 0} total</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" asChild>
            <Link href="/admin/settings">
              <Settings className="size-3.5" /> Beta &amp; Plan Settings
            </Link>
          </Button>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} defaultValue="all">
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !data?.subscriptions.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No subscriptions found</div>
          ) : (
            <div className="divide-y">
              {data.subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {sub.user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{sub.user.name}</p>
                      <Badge className={`text-[10px] ${statusBadge(sub.status)}`}>{sub.status}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{sub.plan}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{sub.user.email}</p>
                  </div>
                  <div className="hidden text-[11px] text-muted-foreground sm:block text-right">
                    {sub.currentPeriodEnd && (
                      <p>Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
                    )}
                    {sub.trialEndsAt && (
                      <p className="text-blue-500">Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()}</p>
                    )}
                    <p>Since {new Date(sub.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {page} of {data.totalPages}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="size-3.5" /></Button>
            <Button size="sm" variant="outline" className="h-7" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
