"use client";

import { useState } from "react";
import Link from "next/link";
import { usePublicBlogs } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, User } from "lucide-react";
import { HeroHeader } from "@/components/custom/landing/hero-header";

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePublicBlogs({ page });

  return (
    <>
      <HeroHeader />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="mt-3 text-muted-foreground">Insights, updates, and guides from the BringBucket team</p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !data?.blogs.length ? (
          <div className="py-20 text-center text-sm text-muted-foreground">No posts yet. Check back soon.</div>
        ) : (
          <div className="space-y-8">
            {data.blogs.map((blog, i) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block">
                <article className={`flex gap-6 ${i === 0 && page === 1 ? "flex-col" : "flex-col sm:flex-row"}`}>
                  {blog.coverImage && (
                    <div className={`overflow-hidden rounded-xl bg-muted ${i === 0 && page === 1 ? "aspect-[2/1] w-full" : "aspect-video w-full sm:w-48 shrink-0"}`}>
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[11px]">{tag}</Badge>
                      ))}
                    </div>
                    <h2 className={`font-semibold tracking-tight group-hover:text-primary transition-colors ${i === 0 && page === 1 ? "text-2xl" : "text-lg"}`}>
                      {blog.title}
                    </h2>
                    {blog.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><User className="size-3" />{blog.author.name}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </article>
                {i < data.blogs.length - 1 && <hr className="mt-8 border-border/50" />}
              </Link>
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
            <Button size="sm" variant="outline" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
