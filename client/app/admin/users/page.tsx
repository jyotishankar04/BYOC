"use client";

import { useState } from "react";
import { useAdminUsers, useAdminUpdateUser, useAdminDeleteUser } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const { data, isLoading } = useAdminUsers({ page, search: query });
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Users</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {data?.total ?? 0} total users
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-56 text-xs"
          />
          <Button type="submit" size="sm" variant="outline" className="h-8">
            <Search className="size-3.5" />
          </Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !data?.users.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No users found</div>
          ) : (
            <div className="divide-y">
              {data.users.map((user) => (
                <div key={user.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      {user.isAdmin && (
                        <Badge className="bg-primary/10 text-primary text-[10px] gap-1">
                          <Shield className="size-2.5" /> Admin
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">{user.plan}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="hidden text-[11px] text-muted-foreground sm:block">
                    <p>{user._count.workspaces} ws · {user._count.files} files · {user._count.shareLinks} links</p>
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn("h-7 text-xs", user.isAdmin ? "text-primary" : "text-muted-foreground")}
                      disabled={updateUser.isPending}
                      onClick={() => updateUser.mutate({ id: user.id, data: { isAdmin: !user.isAdmin } })}
                    >
                      <Shield className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      disabled={deleteUser.isPending}
                      onClick={() => {
                        if (confirm(`Delete user ${user.email}?`)) deleteUser.mutate(user.id);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
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
            <Button size="sm" variant="outline" className="h-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button size="sm" variant="outline" className="h-7" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
