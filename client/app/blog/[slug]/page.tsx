"use client";

import { useParams, useRouter } from "next/navigation";
import { usePublicBlog } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { HeroHeader } from "@/components/custom/landing/hero-header";

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, "<h3 class='text-xl font-semibold mt-6 mb-2'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-2xl font-bold mt-8 mb-3'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-3xl font-bold mt-8 mb-4'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='bg-muted px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-primary underline underline-offset-4 hover:no-underline' target='_blank' rel='noopener'>$1</a>")
    .replace(/^> (.+)$/gm, "<blockquote class='border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4'>$1</blockquote>")
    .replace(/^---$/gm, "<hr class='border-border/50 my-6' />")
    .replace(/\n\n/g, "</p><p class='mb-4'>")
    .replace(/^/, "<p class='mb-4'>")
    .concat("</p>");
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: blog, isLoading } = usePublicBlog(slug);

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

  if (!blog) {
    return (
      <>
        <HeroHeader />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="mt-2 text-muted-foreground">This post may have been removed or the URL is incorrect.</p>
          <Button className="mt-6" onClick={() => router.push("/blog")}>Back to Blog</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Button size="sm" variant="ghost" className="mb-8 -ml-2 gap-1.5 text-muted-foreground" onClick={() => router.push("/blog")}>
          <ArrowLeft className="size-3.5" /> Back to Blog
        </Button>

        {blog.coverImage && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-muted aspect-[2/1]">
            <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {blog.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-tight">{blog.title}</h1>

        {blog.excerpt && (
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{blog.excerpt}</p>
        )}

        <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground border-b pb-6 mb-8">
          <span className="flex items-center gap-1.5"><User className="size-3.5" />{blog.author.name}</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-7"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content ?? "") }}
        />
      </main>
    </>
  );
}
