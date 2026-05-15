"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminBlogs, useAdminCreateBlog, useAdminDeleteBlog } from "@/lib/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronLeft, ChevronRight, Search, Plus, Pencil } from "lucide-react";

export default function AdminBlogsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { data, isLoading } = useAdminBlogs({ page, search: query });
  const createBlog = useAdminCreateBlog();
  const deleteBlog = useAdminDeleteBlog();

  async function handleCreate() {
    const title = prompt("Blog post title:");
    if (!title?.trim()) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const blog = await createBlog.mutateAsync({ title, slug, content: "", published: false });
    router.push(`/admin/blogs/${blog.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Blog Posts</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{data?.total ?? 0} total</p>
        </div>
        <div className="flex gap-2">
          <form onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1); }} className="flex gap-2">
            <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-44 text-xs" />
            <Button type="submit" size="sm" variant="outline" className="h-8"><Search className="size-3.5" /></Button>
          </form>
          <Button size="sm" className="h-8 gap-1.5" onClick={handleCreate} disabled={createBlog.isPending}>
            <Plus className="size-3.5" /> New Post
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !data?.blogs.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No blog posts yet</div>
          ) : (
            <div className="divide-y">
              {data.blogs.map((blog) => (
                <div key={blog.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{blog.title}</p>
                      <Badge className={`text-[10px] ${blog.published ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                      {blog.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {blog.excerpt ? blog.excerpt.slice(0, 80) + (blog.excerpt.length > 80 ? "…" : "") : `/${blog.slug}`}
                    </p>
                  </div>
                  <div className="hidden text-[11px] text-muted-foreground sm:block text-right">
                    <p>By {blog.author.name}</p>
                    <p>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : new Date(blog.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => router.push(`/admin/blogs/${blog.id}`)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive"
                      disabled={deleteBlog.isPending}
                      onClick={() => { if (confirm(`Delete "${blog.title}"?`)) deleteBlog.mutate(blog.id); }}>
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
            <Button size="sm" variant="outline" className="h-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="size-3.5" /></Button>
            <Button size="sm" variant="outline" className="h-7" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
