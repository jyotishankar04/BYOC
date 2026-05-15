"use client";

import { useState } from "react";
import { useAdminWorkspaces, useAdminDeleteWorkspace } from "@/lib/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function AdminWorkspacesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { data, isLoading } = useAdminWorkspaces({ page, search: query });
  const deleteWs = useAdminDeleteWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workspaces</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{data?.total ?? 0} total</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1); }} className="flex gap-2">
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-48 text-xs" />
          <Button type="submit" size="sm" variant="outline" className="h-8"><Search className="size-3.5" /></Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !data?.workspaces.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No workspaces found</div>
          ) : (
            <div className="divide-y">
              {data.workspaces.map((ws) => (
                <div key={ws.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{ws.name}</p>
                      <Badge variant="secondary" className="text-[10px]">{ws.plan}</Badge>
                      {ws.storage && (
                        <Badge className={`text-[10px] ${ws.storage.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {ws.storage.type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Owner: {ws.owner.email}</p>
                  </div>
                  <div className="hidden text-[11px] text-muted-foreground sm:block text-right">
                    <p>{ws._count.members} members · {ws._count.files} files</p>
                    <p>{new Date(ws.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive"
                    disabled={deleteWs.isPending}
                    onClick={() => { if (confirm(`Delete workspace "${ws.name}"?`)) deleteWs.mutate(ws.id); }}>
                    <Trash2 className="size-3.5" />
                  </Button>
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
