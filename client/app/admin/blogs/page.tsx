"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminBlogs, useAdminCreateBlog, useAdminDeleteBlog } from "@/lib/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, ChevronLeft, ChevronRight, Search, Plus, Pencil, FileText } from "lucide-react";

type StatusFilter = "all" | "published" | "draft";

export default function AdminBlogsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  // New post dialog
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const published = status === "all" ? undefined : status === "published";
  const { data, isLoading } = useAdminBlogs({ page, search: query, published });
  const createBlog = useAdminCreateBlog();
  const deleteBlog = useAdminDeleteBlog();

  async function handleCreate() {
    if (!newTitle.trim()) return;
    const blog = await createBlog.mutateAsync({
      title: newTitle.trim(),
      slug: newSlug,
      content: "",
      published: false,
    });
    setNewOpen(false);
    setNewTitle("");
    router.push(`/admin/blogs/${blog.id}`);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteBlog.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Blog Posts</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{data?.total ?? 0} total</p>
        </div>
        <div className="flex gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
              setPage(1);
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 text-xs"
            />
            <Button type="submit" size="sm" variant="outline" className="h-8">
              <Search className="size-3.5" />
            </Button>
          </form>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setNewOpen(true)}
          >
            <Plus className="size-3.5" /> New Post
          </Button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              status === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Blog list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !data?.blogs.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <FileText className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No posts found</p>
              {status !== "all" && (
                <Button size="sm" variant="outline" onClick={() => setStatus("all")}>
                  Clear filter
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {data.blogs.map((blog) => (
                <div key={blog.id} className="flex items-start gap-4 px-5 py-4">
                  {/* Cover image thumbnail */}
                  {blog.coverImage ? (
                    <div className="hidden sm:block h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={blog.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="hidden sm:flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <FileText className="size-4 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium truncate max-w-xs">{blog.title}</p>
                      <Badge
                        className={`text-[10px] shrink-0 ${
                          blog.published
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                        }`}
                      >
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                      {blog.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] shrink-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {blog.excerpt
                        ? blog.excerpt.slice(0, 100) + (blog.excerpt.length > 100 ? "…" : "")
                        : `/${blog.slug}`}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      By {blog.author.name} ·{" "}
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : `Created ${new Date(blog.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1"
                      onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="hidden sm:inline text-xs">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget({ id: blog.id, title: blog.title })}
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

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              disabled={page === data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* New Post dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-title" className="text-xs">Title</Label>
              <Input
                id="new-title"
                placeholder="Post title…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            {newTitle && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Slug (auto-generated)</Label>
                <div className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5">
                  <span className="text-[11px] text-muted-foreground">/blog/</span>
                  <span className="text-[11px] font-mono text-foreground">{newSlug}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!newTitle.trim() || createBlog.isPending}
            >
              {createBlog.isPending ? "Creating…" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong> will be permanently deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
