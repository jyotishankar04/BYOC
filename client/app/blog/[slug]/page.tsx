"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { usePublicBlog } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { HeroHeader } from "@/components/custom/landing/hero-header";
import { BlogContent } from "@/components/custom/blog/blog-content";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: blog, isLoading, error } = usePublicBlog(slug);

  useEffect(() => {
    if (!isLoading && !blog && !error) {
      notFound();
    }
  }, [isLoading, blog, error]);

  if (error) {
    return (
      <>
        <HeroHeader />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-muted-foreground">
            Failed to load this post. Please try again later.
          </p>
          <Button className="mt-6" onClick={() => router.push("/blog")}>
            Back to Blog
          </Button>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <HeroHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  if (!blog) return null;

  return (
    <>
      <HeroHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Button
          size="sm"
          variant="ghost"
          className="mb-8 -ml-2 gap-1.5 text-muted-foreground"
          onClick={() => router.push("/blog")}
        >
          <ArrowLeft className="size-3.5" /> Back to Blog
        </Button>

        {blog.coverImage && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-muted aspect-[2/1] relative">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {blog.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-6 flex items-center gap-5 border-b pb-6 mb-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            {blog.author.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <BlogContent content={blog.content ?? ""} className="text-sm" />
      </main>
    </>
  );
}
