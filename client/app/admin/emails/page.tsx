"use client";

import { useState } from "react";
import { useAdminBroadcasts, useAdminSendBroadcast } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Mail, Send, Users, Clock } from "lucide-react";

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All Users",
  pro: "Pro Users",
  free: "Free Users",
};

const AUDIENCE_COLORS: Record<string, string> = {
  all: "bg-primary/10 text-primary border-primary/20",
  pro: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  free: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

export default function AdminEmailsPage() {
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page] = useState(1);

  const { data: history, isLoading: historyLoading } = useAdminBroadcasts({ page });
  const { mutate: sendBroadcast, isPending } = useAdminSendBroadcast();

  const handleSend = () => {
    sendBroadcast(
      { subject, previewText: previewText || undefined, body, audience },
      {
        onSuccess: () => {
          setSubject("");
          setPreviewText("");
          setBody("");
          setAudience("all");
          setConfirmOpen(false);
        },
      },
    );
  };

  const canSubmit = subject.trim() && body.trim();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email Broadcasts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Send announcements to your users.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Compose */}
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <h2 className="font-semibold">Compose</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="What's the news?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previewText">
              Preview text <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="previewText"
              placeholder="Short summary shown in the inbox"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger id="audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="pro">Pro Users</SelectItem>
                <SelectItem value="free">Free Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              placeholder="Write your message here...&#10;&#10;Use blank lines to create paragraphs."
              className="min-h-[200px] resize-none font-mono text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Plain text. Blank lines become paragraphs in the email.</p>
          </div>

          <Button
            className="w-full"
            disabled={!canSubmit || isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <Send className="size-4 mr-2" />
            Send to {AUDIENCE_LABELS[audience]}
          </Button>
        </div>

        {/* History */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <h2 className="font-semibold">Broadcast History</h2>
            {history?.total !== undefined && (
              <span className="ml-auto text-xs text-muted-foreground">{history.total} sent</span>
            )}
          </div>

          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : !history?.broadcasts.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No broadcasts sent yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.broadcasts.map((b) => (
                <div key={b.id} className="rounded-lg border p-4 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-sm font-medium leading-snug">{b.subject}</p>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${AUDIENCE_COLORS[b.audience] ?? ""}`}
                    >
                      {AUDIENCE_LABELS[b.audience] ?? b.audience}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {b.recipientCount.toLocaleString()} recipients
                    </span>
                    <span>·</span>
                    <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>by {b.admin.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send broadcast?</AlertDialogTitle>
            <AlertDialogDescription>
              This will queue emails to <strong>{AUDIENCE_LABELS[audience]}</strong> with subject:{" "}
              <strong>"{subject}"</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={isPending}>
              {isPending ? "Sending…" : "Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
