"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

function useAdminActivity(params: { page?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "activity", params],
    queryFn: async () => {
      const res = await api.get<{ logs: ActivityLog[]; total: number; totalPages: number }>(
        "/api/v1/admin/activity",
        { params }
      );
      return res.data;
    },
  });
}

export default function AdminActivityPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminActivity({ page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Activity Log</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{data?.total ?? 0} events</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !data?.logs.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No activity yet</div>
          ) : (
            <div className="divide-y">
              {data.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary/60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{log.action}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {log.user ? `${log.user.name} · ` : "System · "}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground font-mono truncate">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
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
