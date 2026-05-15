"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminBlog, useAdminUpdateBlog } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Globe, Tag, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: blog, isLoading } = useAdminBlog(id);
  const updateBlog = useAdminUpdateBlog();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!blog) return;
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt ?? "");
    setContent(blog.content ?? "");
    setCoverImage(blog.coverImage ?? "");
    setPublished(blog.published);
    setTags(blog.tags ?? []);
  }, [blog]);

  function markDirty() { setDirty(true); }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags([...tags, t]); markDirty(); }
    setTagInput("");
  }

  function removeTag(t: string) { setTags(tags.filter((x) => x !== t)); markDirty(); }

  async function handleSave() {
    await updateBlog.mutateAsync({ id, data: { title, slug, excerpt, content, coverImage, published, tags } });
    setDirty(false);
  }

  async function handlePublishToggle(val: boolean) {
    setPublished(val);
    markDirty();
    await updateBlog.mutateAsync({ id, data: { published: val } });
    setDirty(false);
    toast.success(val ? "Post published" : "Post unpublished");
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!blog) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Blog post not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground" onClick={() => router.push("/admin/blogs")}>
          <ArrowLeft className="size-3.5" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="published" checked={published} onCheckedChange={handlePublishToggle} disabled={updateBlog.isPending} />
            <Label htmlFor="published" className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Globe className="size-3" />
              {published ? "Published" : "Draft"}
            </Label>
          </div>
          <Button size="sm" className="h-8 gap-1.5" onClick={handleSave} disabled={!dirty || updateBlog.isPending}>
            <Save className="size-3.5" /> Save
          </Button>
        </div>
      </div>

      {/* Title & slug */}
      <div className="space-y-3">
        <Input
          placeholder="Post title…"
          value={title}
          onChange={(e) => { setTitle(e.target.value); markDirty(); }}
          className="h-10 text-base font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
        />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground shrink-0">Slug:</span>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); markDirty(); }}
            className="h-6 text-[11px] font-mono border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>
      </div>

      {/* Cover image */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Cover image URL</Label>
        <Input
          placeholder="https://…"
          value={coverImage}
          onChange={(e) => { setCoverImage(e.target.value); markDirty(); }}
          className="h-8 text-xs"
        />
        {coverImage && (
          <img src={coverImage} alt="Cover preview" className="mt-2 h-32 w-full rounded-lg object-cover" />
        )}
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Excerpt</Label>
        <Textarea
          placeholder="Short description shown in listing…"
          value={excerpt}
          onChange={(e) => { setExcerpt(e.target.value); markDirty(); }}
          className="min-h-16 text-sm resize-none"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1"><Tag className="size-3" /> Tags</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1 text-[11px] pr-1">
              {t}
              <button onClick={() => removeTag(t)} className="hover:text-destructive"><X className="size-2.5" /></button>
            </Badge>
          ))}
          <Input
            placeholder="Add tag, press Enter…"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            className="h-6 w-40 text-xs border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Content (Markdown)</Label>
        <Textarea
          placeholder="Write your post in Markdown…"
          value={content}
          onChange={(e) => { setContent(e.target.value); markDirty(); }}
          className="min-h-[400px] font-mono text-sm resize-y"
        />
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={!dirty || updateBlog.isPending} className="gap-1.5">
          <Save className="size-3.5" /> Save changes
        </Button>
      </div>
    </div>
  );
}
