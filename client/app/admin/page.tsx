"use client";

import { useAdminStats } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText, Link2, CreditCard, BookOpen } from "lucide-react";

const STAT_CARDS = [
  { key: "totalUsers", label: "Total Users", sub: (s: Record<string, number>) => `+${s.newUsersThisWeek} this week`, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "totalWorkspaces", label: "Workspaces", sub: () => "Across all users", icon: Building2, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "totalFiles", label: "Total Files", sub: () => "Uploaded files", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "totalShareLinks", label: "Active Links", sub: () => "Share links active", icon: Link2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "activeSubscriptions", label: "Subscriptions", sub: () => "Active & trialing", icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
  { key: "publishedBlogs", label: "Blog Posts", sub: (s: Record<string, number>) => `${s.totalBlogs} total`, icon: BookOpen, color: "text-pink-500", bg: "bg-pink-500/10" },
] as const;

export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();
  const stats = data?.stats as Record<string, number> | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {STAT_CARDS.map(({ key, label, sub, icon: Icon, color, bg }) => (
          <Card key={key}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`size-4 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">
                    {isLoading ? "—" : (stats?.[key] ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {stats ? sub(stats) : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !data?.recentActivity?.length ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity</div>
          ) : (
            <div className="divide-y">
              {(data.recentActivity as Array<Record<string, unknown>>).map((log) => (
                <div key={log.id as string} className="flex items-center gap-3 px-5 py-3">
                  <div className="size-2 shrink-0 rounded-full bg-primary/60" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{log.action as string}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(log.user as Record<string, string>)?.name} · {new Date(log.createdAt as string).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
