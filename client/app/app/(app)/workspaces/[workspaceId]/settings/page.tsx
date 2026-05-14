"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudServerIcon,
  UserCircle02Icon,
  Delete01Icon,
  Cancel01Icon,
  PencilEdit01Icon,
  CheckmarkCircle01Icon,
  ArrowLeft01Icon,
  InformationCircleIcon,
  UserAdd01Icon,
  Loading01Icon,
  FolderSyncIcon,
  Copy01Icon,
  ArrowDown01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  useWorkspace,
  type MemberRole,
  type PermissionLevel,
  type Workspace,
} from "@/lib/workspace-context";
import {
  useSyncStatus,
  useTriggerSync,
  useConnectProvider,
  useUpdateProvider,
  useDisconnectProvider,
  type ProviderType,
  type ConnectProviderInput,
} from "@/lib/provider";
import { ProviderGuideDialog } from "@/components/custom/provider-guide-dialog";
import { LockedState } from "@/components/custom/subscription/locked-state";
import { UpgradeTooltip } from "@/components/custom/subscription/upgrade-tooltip";
import { UsageGate } from "@/components/custom/subscription/usage-gate";
import { providerTypeToGuideKey } from "@/lib/provider-guides";
import { useSession } from "@/lib/auth-client";
import {
  useMembers,
  useInvites,
  useInviteByEmail,
  useChangeRole,
  useRemoveMember,
  useRevokeInvite,
  toInitials,
} from "@/lib/members";
import {
  useUpdateWorkspace,
  useUpdatePermissions,
  useUpdateSecurity,
  useDeleteWorkspace,
  useTransferOwnership,
} from "@/lib/workspace-settings";
import {
  canUseProvider,
  featureUpgradeMessage,
  planDisplayName,
  useSubscriptionSnapshot,
} from "@/lib/subscription";

// ─── Section nav ───────────────────────────────────────────────────────────────

type Section =
  | "overview"
  | "general"
  | "members"
  | "storage"
  | "permissions"
  | "security"
  | "billing"
  | "danger";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "general", label: "General" },
  { id: "members", label: "Members" },
  { id: "storage", label: "Storage" },
  { id: "permissions", label: "Permissions" },
  { id: "security", label: "Security" },
  { id: "billing", label: "Billing" },
  { id: "danger", label: "Danger Zone" },
];

// ─── Plan / type badge helpers ─────────────────────────────────────────────────

const PLAN_STYLE: Record<string, string> = {
  Free: "bg-muted text-muted-foreground",
  Pro: "bg-blue-500/10 text-blue-600",
  Team: "bg-violet-500/10 text-violet-600",
};

const ROLE_STYLE: Record<MemberRole, string> = {
  Owner: "bg-amber-500/10 text-amber-600",
  Admin: "bg-blue-500/10 text-blue-600",
  Member: "bg-muted text-muted-foreground",
  Viewer: "bg-muted text-muted-foreground",
};

// ─── Inline toggle ─────────────────────────────────────────────────────────────

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        value ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
          value && "translate-x-4",
        )}
      />
    </button>
  );
}

// ─── Section: Overview ─────────────────────────────────────────────────────────

function OverviewSection({ workspace }: { workspace: Workspace }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace identity and basic information.
        </p>
      </div>
      <Separator />

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-xl text-2xl font-bold text-white",
            workspace.color,
          )}
        >
          {workspace.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{workspace.name}</p>
          <p className="text-sm text-muted-foreground">
            bringbucket.app/{workspace.slug}
          </p>
        </div>
        <Badge className={cn("ml-auto", PLAN_STYLE[workspace.plan])}>
          {workspace.plan}
        </Badge>
      </div>

      <Separator />

      {/* Info grid */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "Workspace name", value: workspace.name },
          { label: "Slug", value: workspace.slug },
          { label: "Type", value: workspace.type },
          { label: "Plan", value: workspace.plan },
          { label: "Owner", value: workspace.owner },
          { label: "Owner email", value: workspace.ownerEmail },
          { label: "Created", value: workspace.createdAt },
          {
            label: "Members",
            value: `${workspace.members.length} member${workspace.members.length !== 1 ? "s" : ""}`,
          },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-lg border bg-muted/20 px-4 py-3"
          >
            <dt className="text-[11px] font-medium text-muted-foreground">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Section: General ──────────────────────────────────────────────────────────

function GeneralSection({ workspace }: { workspace: Workspace }) {
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  const update = useUpdateWorkspace(workspace.id);

  const dirty =
    name.trim() !== workspace.name || slug.trim() !== workspace.slug;

  const handleSave = () => {
    const payload: { name?: string; slug?: string } = {};
    if (name.trim() && name.trim() !== workspace.name)
      payload.name = name.trim();
    if (slug.trim() && slug.trim() !== workspace.slug)
      payload.slug = slug.trim();
    if (!Object.keys(payload).length) return;
    update.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">General</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your workspace name and slug.
        </p>
      </div>
      <Separator />

      <div className="max-w-md space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Workspace logo</Label>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-lg text-lg font-bold text-white",
                workspace.color,
              )}
            >
              {workspace.name.charAt(0)}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              id="ws-logo-upload"
              onChange={() => {}}
              disabled
            />
            <Button size="sm" variant="outline" disabled title="Logo upload coming soon">
              Upload logo
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            PNG or JPG up to 2 MB. Square recommended.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="g-name" className="text-xs font-medium">
            Workspace name
          </Label>
          <Input
            id="g-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="g-slug" className="text-xs font-medium">
            Slug
          </Label>
          <div className="flex items-center">
            <span className="flex h-8 items-center rounded-l-md border border-r-0 bg-muted px-2.5 text-xs text-muted-foreground shrink-0">
              bringbucket.app/
            </span>
            <Input
              id="g-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-8 rounded-l-none text-sm"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || update.isPending}
        >
          {update.isPending ? (
            <>
              <HugeiconsIcon
                icon={Loading01Icon}
                className="size-3.5 animate-spin"
                strokeWidth={2}
              />{" "}
              Saving…
            </>
          ) : update.isSuccess ? (
            <>
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="size-3.5"
                strokeWidth={2}
              />{" "}
              Saved
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Section: Members ──────────────────────────────────────────────────────────

type MembersTab = "members" | "invites";

function MembersSection({
  workspace,
  isAdmin,
}: {
  workspace: Workspace;
  isAdmin: boolean;
}) {
  const { checks, workspaceRemaining, workspacePlan, workspaceFeatureAccess, loading } =
    useSubscriptionSnapshot();
  const [tab, setTab] = useState<MembersTab>("members");
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: members = [], isLoading: loadingMembers } = useMembers(
    workspace.id,
  );

  const { data: invites = [], isLoading: loadingInvites } = useInvites(
    workspace.id,
    isAdmin,
  );

  const inviteByEmail = useInviteByEmail(workspace.id);
  const changeRole = useChangeRole(workspace.id);
  const removeMember = useRemoveMember(workspace.id);
  const revokeInvite = useRevokeInvite(workspace.id);

  const handleInvite = () => {
    const email = inviteEmail.trim();
    if (!email || !checks.canInviteMembers) return;
    inviteByEmail.mutate(email, { onSuccess: () => setInviteEmail("") });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {loadingMembers
            ? "Loading…"
            : `${members.length} active member${members.length !== 1 ? "s" : ""}`}
        </p>
      </div>
      <Separator />

      {/* Invite form — admin/owner only */}
      {isAdmin && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs font-medium">Invite by email</Label>
            {!loading ? (
              <p className="text-[11px] text-muted-foreground">
                {workspaceRemaining?.teamMembers === null
                  ? "Unlimited seats"
                  : `${workspaceRemaining?.teamMembers ?? 0} seat${workspaceRemaining?.teamMembers === 1 ? "" : "s"} remaining on ${planDisplayName(workspacePlan)}`}
              </p>
            ) : null}
          </div>
          <UsageGate
            allowed={checks.canInviteMembers}
            message={`Upgrade to ${workspacePlan === "Free" ? "Pro" : "Team"} to invite more members to this workspace.`}
          >
            <div className="flex gap-2">
              <Input
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="h-8 flex-1 text-sm"
                disabled={!checks.canInviteMembers}
              />
              <Button
                size="sm"
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviteByEmail.isPending || !checks.canInviteMembers}
              >
                {inviteByEmail.isPending ? (
                  <HugeiconsIcon
                    icon={Loading01Icon}
                    className="size-3.5 animate-spin"
                    strokeWidth={2}
                  />
                ) : (
                  <HugeiconsIcon
                    icon={UserAdd01Icon}
                    className="size-3.5"
                    strokeWidth={2}
                  />
                )}
                Invite
              </Button>
            </div>
          </UsageGate>
        </div>
      )}

      {/* Tab switcher — invites tab only visible to admin/owner */}
      {isAdmin && (
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
          {(["members", "invites"] as MembersTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors capitalize",
                tab === t
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
              {t === "invites" && invites.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {invites.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Members list */}
      {tab === "members" && (
        <div className="overflow-hidden rounded-xl border">
          {loadingMembers ? (
            <div className="flex h-24 items-center justify-center">
              <HugeiconsIcon
                icon={Loading01Icon}
                className="size-5 animate-spin text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
          ) : members.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No members yet.
            </div>
          ) : (
            members.map((member, i) => (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  i > 0 && "border-t",
                )}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px]">
                    {toInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {member.user.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <p className="hidden text-[11px] text-muted-foreground sm:block">
                  {new Date(member.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {member.role === "Owner" ? (
                  <Badge className={cn("text-[10px]", ROLE_STYLE["Owner"])}>
                    Owner
                  </Badge>
                ) : isAdmin ? (
                  <UpgradeTooltip
                    disabled={!workspaceFeatureAccess?.teamManagement}
                    message={featureUpgradeMessage("teamManagement")}
                  >
                    <Select
                      value={member.role}
                      onValueChange={(v) =>
                        changeRole.mutate({
                          userId: member.userId,
                          role: v as MemberRole,
                        })
                      }
                      disabled={changeRole.isPending || !workspaceFeatureAccess?.teamManagement}
                    >
                      <SelectTrigger className="h-7 w-24 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </UpgradeTooltip>
                ) : (
                  <Badge className={cn("text-[10px]", ROLE_STYLE[member.role])}>
                    {member.role}
                  </Badge>
                )}
                {isAdmin && member.role !== "Owner" && (
                  <button
                    onClick={() => removeMember.mutate(member.userId)}
                    disabled={removeMember.isPending}
                    className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      className="size-3.5"
                      strokeWidth={2}
                    />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Invites list */}
      {tab === "invites" && (
        <div className="overflow-hidden rounded-xl border">
          {loadingInvites ? (
            <div className="flex h-24 items-center justify-center">
              <HugeiconsIcon
                icon={Loading01Icon}
                className="size-5 animate-spin text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
          ) : invites.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No pending invites.
            </div>
          ) : (
            invites.map((invite, i) => (
              <div
                key={invite.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  i > 0 && "border-t",
                )}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px]">
                    {toInitials(invite.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {invite.user.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {invite.user.email}
                  </p>
                  {invite.invitedBy && (
                    <p className="text-[11px] text-muted-foreground">
                      Invited by {invite.invitedBy.name}
                    </p>
                  )}
                </div>
                <Badge className="text-[10px] bg-amber-500/10 text-amber-600">
                  Pending
                </Badge>
                <button
                  onClick={() => revokeInvite.mutate(invite.userId)}
                  disabled={revokeInvite.isPending}
                  className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    className="size-3.5"
                    strokeWidth={2}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── CORS setup card ───────────────────────────────────────────────────────────

const CORS_JSON = `[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"]
  }
]`;

function IamPolicyCard({ bucketName }: { bucketName: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const iamPolicy = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": "arn:aws:s3:::${bucketName}"
    },
    {
      "Sid": "ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::${bucketName}/*"
    }
  ]
}`;

  const copy = () => {
    navigator.clipboard.writeText(iamPolicy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20">
      <CardContent className="pt-4 pb-3 space-y-3">
        <button
          className="flex w-full items-start gap-3 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <HugeiconsIcon
            icon={Shield01Icon}
            className="size-4 mt-0.5 shrink-0 text-blue-600"
            strokeWidth={1.5}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              IAM policy for {bucketName}
            </p>
            <p className="mt-0.5 text-[11px] text-blue-700/80 dark:text-blue-300/70">
              Attach this inline policy to your IAM user. It grants the minimum
              S3 permissions needed.
            </p>
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              "size-4 shrink-0 mt-0.5 text-blue-600 transition-transform",
              open && "rotate-180",
            )}
            strokeWidth={1.5}
          />
        </button>

        {open && (
          <div className="space-y-2">
            <p className="text-[11px] text-blue-700/80 dark:text-blue-300/70">
              In AWS IAM → Users → your user →{" "}
              <span className="font-medium">Permissions</span> →{" "}
              <span className="font-medium">Add permissions</span> →{" "}
              <span className="font-medium">Create inline policy</span>, paste:
            </p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-md bg-blue-100/80 dark:bg-blue-900/30 p-3 text-[11px] font-mono text-blue-900 dark:text-blue-100 leading-relaxed">
                {iamPolicy}
              </pre>
              <button
                onClick={copy}
                className="absolute right-2 top-2 flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-blue-700 dark:text-blue-300 hover:bg-blue-200/60 dark:hover:bg-blue-800/40 transition-colors"
              >
                <HugeiconsIcon
                  icon={Copy01Icon}
                  className="size-3"
                  strokeWidth={2}
                />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CorsSetupCard({ providerName }: { providerName: string; bucketName: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(CORS_JSON).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const providerInstructions: Record<string, { title: string; path: string }> = {
    S3: {
      title: "AWS Console",
      path: "S3 → your bucket → Permissions → Cross-origin resource sharing (CORS)",
    },
    R2: {
      title: "Cloudflare Dashboard",
      path: "R2 → your bucket → Settings → CORS Policies",
    },
    MinIO: {
      title: "MinIO Console",
      path: "Buckets → your bucket → Access Rules → CORS",
    },
  };

  const instr = providerInstructions[providerName] ?? {
    title: "your provider's dashboard",
    path: "your bucket's CORS settings",
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
      <CardContent className="pt-4 pb-3 space-y-3">
        <button
          className="flex w-full items-start gap-3 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="size-4 mt-0.5 shrink-0 text-amber-600"
            strokeWidth={1.5}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              CORS configuration required
            </p>
            <p className="mt-0.5 text-[11px] text-amber-700/80 dark:text-amber-300/70">
              Browser uploads go directly to your storage. Your bucket needs a CORS policy
              to allow this.
            </p>
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              "size-4 shrink-0 mt-0.5 text-amber-600 transition-transform",
              open && "rotate-180",
            )}
            strokeWidth={1.5}
          />
        </button>

        {open && (
          <div className="space-y-2">
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
              In the {instr.title} →{" "}
              <span className="font-medium">{instr.path}</span>
              , paste:
            </p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-md bg-amber-100/80 dark:bg-amber-900/30 p-3 text-[11px] font-mono text-amber-900 dark:text-amber-100 leading-relaxed">
                {CORS_JSON}
              </pre>
              <button
                onClick={copy}
                className="absolute right-2 top-2 flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-amber-700 dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-800/40 transition-colors"
              >
                <HugeiconsIcon
                  icon={Copy01Icon}
                  className="size-3"
                  strokeWidth={2}
                />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section: Storage ──────────────────────────────────────────────────────────

const SYNC_STATUS_LABEL: Record<string, string> = {
  idle: "Not synced",
  pending: "Queued…",
  syncing: "Syncing…",
  completed: "Synced",
  failed: "Failed",
};

const SYNC_STATUS_COLOR: Record<string, string> = {
  idle: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/10 text-amber-600",
  syncing: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-destructive/10 text-destructive",
};

const PROVIDER_TYPES: ProviderType[] = [
  "S3",
  "R2",
  "MinIO",
  "Supabase",
  "Other",
];

interface ProviderFormState {
  providerType: ProviderType;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpointUrl: string;
}

function ProviderFormDialog({
  open,
  onOpenChange,
  mode,
  workspaceId,
  defaults,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "connect" | "update";
  workspaceId: string;
  defaults?: Partial<ProviderFormState>;
}) {
  const { subscription, workspacePlan } = useSubscriptionSnapshot();
  const connectProvider = useConnectProvider(workspaceId);
  const updateProvider = useUpdateProvider(workspaceId);

  const [form, setForm] = useState<ProviderFormState>({
    providerType: defaults?.providerType ?? "S3",
    bucket: defaults?.bucket ?? "",
    region: defaults?.region ?? "",
    accessKeyId: defaults?.accessKeyId ?? "",
    secretAccessKey: defaults?.secretAccessKey ?? "",
    endpointUrl: defaults?.endpointUrl ?? "",
  });

  // Reset form fields whenever the dialog opens
  useEffect(() => {
    if (open) {
      const resetTimer = window.setTimeout(() => {
        setForm({
          providerType: defaults?.providerType ?? "S3",
          bucket: defaults?.bucket ?? "",
          region: defaults?.region ?? "",
          accessKeyId: "",
          secretAccessKey: "",
          endpointUrl: defaults?.endpointUrl ?? "",
        });
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: keyof ProviderFormState, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const isPending = connectProvider.isPending || updateProvider.isPending;
  const [guideOpen, setGuideOpen] = useState(false);
  const providerAllowed = canUseProvider(subscription, form.providerType);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!providerAllowed) return;
    const payload: Record<string, string> = {
      providerType: form.providerType,
      bucket: form.bucket,
    };
    if (form.region) payload.region = form.region;
    if (form.endpointUrl) payload.endpointUrl = form.endpointUrl;

    if (mode === "connect") {
      payload.accessKeyId = form.accessKeyId;
      payload.secretAccessKey = form.secretAccessKey;
      await connectProvider.mutateAsync(
        payload as unknown as ConnectProviderInput,
      );
    } else {
      if (form.accessKeyId) {
        payload.accessKeyId = form.accessKeyId;
        payload.secretAccessKey = form.secretAccessKey;
      }
      await updateProvider.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "connect"
                ? "Connect storage provider"
                : "Update storage provider"}
            </DialogTitle>
            {mode === "connect" && (
              <p className="text-[11px] text-muted-foreground">
                Need help?{" "}
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                >
                  Show setup guide for {form.providerType}
                </button>
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="prov-type">Provider type</Label>
              <Select
                value={form.providerType}
                onValueChange={(v) => set("providerType", v as ProviderType)}
              >
                <SelectTrigger id="prov-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_TYPES.map((t) => (
                    <SelectItem
                      key={t}
                      value={t}
                      disabled={!canUseProvider(subscription, t)}
                    >
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!providerAllowed ? (
                <p className="text-[11px] text-amber-600">
                  Upgrade to Pro to use {form.providerType} for this workspace. Current plan: {planDisplayName(workspacePlan)}.
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prov-bucket">
                Bucket name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prov-bucket"
                value={form.bucket}
                onChange={(e) => set("bucket", e.target.value)}
                placeholder="my-bucket"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prov-region">
                  Region
                  {form.providerType === "R2" && (
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      (optional for R2)
                    </span>
                  )}
                </Label>
                <Input
                  id="prov-region"
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                  placeholder={form.providerType === "R2" ? "auto (optional)" : "us-east-1"}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prov-endpoint">
                  Endpoint URL
                  {["R2", "MinIO", "Supabase", "Other"].includes(form.providerType) ? (
                    <span className="text-destructive"> *</span>
                  ) : (
                    <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                      (optional)
                    </span>
                  )}
                </Label>
                <Input
                  id="prov-endpoint"
                  value={form.endpointUrl}
                  onChange={(e) => set("endpointUrl", e.target.value)}
                  placeholder={
                    form.providerType === "R2"
                      ? "https://<account_id>.r2.cloudflarestorage.com"
                      : form.providerType === "MinIO"
                        ? "http://localhost:9000"
                        : "https://…"
                  }
                  required={["R2", "MinIO", "Supabase", "Other"].includes(form.providerType)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prov-key">
                Access key ID
                {mode === "update" && (
                  <span className="ml-1 text-[11px] text-muted-foreground">
                    (leave blank to keep current)
                  </span>
                )}
                {mode === "connect" && (
                  <span className="text-destructive"> *</span>
                )}
              </Label>
              <Input
                id="prov-key"
                value={form.accessKeyId}
                onChange={(e) => set("accessKeyId", e.target.value)}
                placeholder="AKIA…"
                required={mode === "connect"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prov-secret">
                Secret access key
                {mode === "update" && (
                  <span className="ml-1 text-[11px] text-muted-foreground">
                    (leave blank to keep current)
                  </span>
                )}
                {mode === "connect" && (
                  <span className="text-destructive"> *</span>
                )}
              </Label>
              <Input
                id="prov-secret"
                type="password"
                value={form.secretAccessKey}
                onChange={(e) => set("secretAccessKey", e.target.value)}
                placeholder="••••••••"
                required={mode === "connect"}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !providerAllowed}>
                {isPending && (
                  <HugeiconsIcon
                    icon={Loading01Icon}
                    className="size-3.5 animate-spin"
                    strokeWidth={1.5}
                  />
                )}
                {mode === "connect" ? "Connect" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ProviderGuideDialog
        open={guideOpen}
        onOpenChange={setGuideOpen}
        providerKey={providerTypeToGuideKey(form.providerType)}
        bucketName={form.bucket || undefined}
      />
    </>
  );
}

function StorageSection({ workspace }: { workspace: Workspace }) {
  const { subscription, workspacePlan } = useSubscriptionSnapshot();
  const s = workspace.storage;
  const { data: syncData, isLoading: syncLoading } = useSyncStatus(
    workspace.id,
  );
  const triggerSync = useTriggerSync(workspace.id);
  const disconnectProvider = useDisconnectProvider(workspace.id);

  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [providerDialogMode, setProviderDialogMode] = useState<
    "connect" | "update"
  >("connect");

  const syncStatus = syncData?.syncStatus ?? s?.syncStatus ?? "idle";
  const isActive = syncStatus === "pending" || syncStatus === "syncing";
  const total = syncData?.syncTotalObjects ?? s?.syncTotalObjects ?? 0;
  const completed =
    syncData?.syncCompletedObjects ?? s?.syncCompletedObjects ?? 0;
  const progress =
    total > 0 ? Math.round((completed / total) * 100) : isActive ? null : 100;

  function openConnect() {
    setProviderDialogMode("connect");
    setProviderDialogOpen(true);
  }

  function openUpdate() {
    setProviderDialogMode("update");
    setProviderDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Storage Provider</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your connected cloud storage bucket.
        </p>
      </div>
      <Separator />

      {s ? (
        <div className="space-y-4">
          {/* Provider card */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <HugeiconsIcon
                    icon={CloudServerIcon}
                    className="size-5 text-amber-600"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Last checked {s.lastChecked}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Bucket", value: s.bucket },
                  { label: "Region", value: s.region },
                  { label: "Status", value: s.status },
                ].map((row) => (
                  <div key={row.label}>
                    <dt className="text-[11px] text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="mt-0.5 text-xs font-medium font-mono">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Sync card */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={FolderSyncIcon}
                    className={cn(
                      "size-4",
                      isActive
                        ? "text-blue-500 animate-spin"
                        : "text-muted-foreground",
                    )}
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-sm font-medium">File Sync</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(syncData?.lastSyncedAt ?? s.lastSyncedAt)
                        ? `Last synced ${syncData?.lastSyncedAt ?? s.lastSyncedAt}`
                        : "Never synced"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={cn("text-[10px]", SYNC_STATUS_COLOR[syncStatus])}
                  >
                    {SYNC_STATUS_LABEL[syncStatus] ?? syncStatus}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isActive || triggerSync.isPending || syncLoading}
                    onClick={() => triggerSync.mutate()}
                  >
                    {isActive || triggerSync.isPending ? (
                      <HugeiconsIcon
                        icon={Loading01Icon}
                        className="size-3.5 animate-spin"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={FolderSyncIcon}
                        className="size-3.5"
                        strokeWidth={1.5}
                      />
                    )}
                    {isActive ? "Syncing…" : "Sync Now"}
                  </Button>
                </div>
              </div>

              {isActive && (
                <div className="space-y-1">
                  <Progress value={progress ?? 0} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground">
                    {total > 0
                      ? `${completed.toLocaleString()} / ${total.toLocaleString()} objects`
                      : "Scanning bucket…"}
                  </p>
                </div>
              )}

              {syncStatus === "completed" && total > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {total.toLocaleString()} object{total !== 1 ? "s" : ""} synced
                </p>
              )}

              {syncStatus === "failed" && (
                <p className="text-[11px] text-destructive">
                  Sync failed. Check your provider credentials and try again.
                </p>
              )}
            </CardContent>
          </Card>

          {s.name === "S3" && <IamPolicyCard bucketName={s.bucket} />}
          <CorsSetupCard providerName={s.name} bucketName={s.bucket} />

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={openUpdate}>
              <HugeiconsIcon
                icon={PencilEdit01Icon}
                className="size-3.5"
                strokeWidth={1.5}
              />
              Change provider
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                  disabled={disconnectProvider.isPending}
                >
                  {disconnectProvider.isPending ? (
                    <HugeiconsIcon
                      icon={Loading01Icon}
                      className="size-3.5 animate-spin"
                      strokeWidth={1.5}
                    />
                  ) : null}
                  Disconnect
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Disconnect storage provider?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the provider configuration from this workspace.
                    Files already synced remain in the database, but no new
                    uploads or syncs will be possible until you reconnect a
                    provider. Your actual S3 bucket and its contents are not
                    affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => disconnectProvider.mutate()}
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
        <div className="flex h-36 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
          <HugeiconsIcon
            icon={CloudServerIcon}
            className="size-8 text-muted-foreground/30"
            strokeWidth={1}
          />
          <p className="text-sm text-muted-foreground">No provider connected</p>
          <p className="max-w-sm text-center text-[11px] text-muted-foreground">
            {planDisplayName(workspacePlan)} workspaces can connect {subscription?.limits.allowedProviders.join(", ") ?? "supported"} providers.
          </p>
          <Button size="sm" onClick={openConnect}>
            Connect provider
          </Button>
        </div>
      )}

      <ProviderFormDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        mode={providerDialogMode}
        workspaceId={workspace.id}
        defaults={
          providerDialogMode === "update" && s
            ? {
                providerType: s.name as ProviderType,
                bucket: s.bucket,
                region: s.region ?? "",
              }
            : undefined
        }
      />
    </div>
  );
}

// ─── Section: Permissions ──────────────────────────────────────────────────────

function PermissionsSection({
  workspace,
  isAdmin,
}: {
  workspace: Workspace;
  isAdmin: boolean;
}) {
  const { workspaceFeatureAccess } = useSubscriptionSnapshot();
  const [perms, setPerms] = useState(workspace.permissions);
  const updatePerms = useUpdatePermissions(workspace.id);
  const canManageTeamPermissions = Boolean(workspaceFeatureAccess?.teamManagement);

  const set = (key: keyof typeof perms, val: PermissionLevel) => {
    if (!isAdmin) return;
    setPerms((prev) => ({ ...prev, [key]: val }));
  };

  const ROWS: {
    key: keyof typeof perms;
    label: string;
    description: string;
  }[] = [
    {
      key: "canUpload",
      label: "Upload files",
      description: "Minimum role required to upload files",
    },
    {
      key: "canCreateFolders",
      label: "Create folders",
      description: "Minimum role required to create folders",
    },
    {
      key: "canShareFiles",
      label: "Share files",
      description: "Minimum role required to create share links",
    },
    {
      key: "canDeleteFiles",
      label: "Delete files",
      description: "Minimum role required to delete files",
    },
    {
      key: "canManageBilling",
      label: "Manage billing",
      description: "Minimum role required to manage billing",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Permissions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Control what each role can do in this workspace.
          </p>
        </div>
        {!isAdmin && (
          <Badge variant="secondary" className="shrink-0 mt-0.5">
            View only
          </Badge>
        )}
        {isAdmin && !canManageTeamPermissions && (
          <Badge variant="secondary" className="shrink-0 mt-0.5">
            Team plan required
          </Badge>
        )}
      </div>
      <Separator />

      {isAdmin && !canManageTeamPermissions ? (
        <LockedState
          title="Advanced permissions are locked"
          description="Custom role thresholds for uploads, sharing, and billing are available on the Team plan."
        />
      ) : null}

      <div className="space-y-3">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className={cn(
              "flex items-center gap-4 rounded-lg border px-4 py-3",
              !isAdmin && "opacity-60",
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-[11px] text-muted-foreground">
                {row.description}
              </p>
            </div>
            <Select
              value={perms[row.key]}
              onValueChange={(v) => set(row.key, v as PermissionLevel)}
              disabled={!isAdmin || !canManageTeamPermissions}
            >
              <SelectTrigger className="h-7 w-28 text-xs shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner only</SelectItem>
                <SelectItem value="Admin">Admin+</SelectItem>
                <SelectItem value="Member">Member+</SelectItem>
                <SelectItem value="Viewer">Everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {isAdmin && (
        <Button
          size="sm"
          onClick={() => updatePerms.mutate(perms)}
          disabled={updatePerms.isPending || !canManageTeamPermissions}
        >
          {updatePerms.isPending ? (
            <>
              <HugeiconsIcon
                icon={Loading01Icon}
                className="size-3.5 animate-spin"
                strokeWidth={2}
              />{" "}
              Saving…
            </>
          ) : updatePerms.isSuccess ? (
            <>
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="size-3.5"
                strokeWidth={2}
              />{" "}
              Saved
            </>
          ) : (
            "Save permissions"
          )}
        </Button>
      )}
    </div>
  );
}

// ─── Section: Security ─────────────────────────────────────────────────────────

function SecuritySection({
  workspace,
  isAdmin,
}: {
  workspace: Workspace;
  isAdmin: boolean;
}) {
  const { workspaceFeatureAccess } = useSubscriptionSnapshot();
  const [sec, setSec] = useState(workspace.security);
  const updateSec = useUpdateSecurity(workspace.id);

  const toggle = (key: keyof typeof sec) => {
    if (!isAdmin) return;
    const updated = { ...sec, [key]: !sec[key] };
    setSec(updated);
    updateSec.mutate({ [key]: updated[key] });
  };

  const ROWS: {
    key: keyof typeof sec;
    label: string;
    description: string;
    feature?: "passwordProtectedLinks" | "teamManagement" | "auditLogs";
  }[] =
    [
      {
        key: "requirePasswordForPublicLinks",
        label: "Require password for public links",
        description: "Visitors must enter a password to access shared files",
        feature: "passwordProtectedLinks",
      },
      {
        key: "disablePublicSharing",
        label: "Disable public sharing",
        description:
          "Prevent all members from creating publicly accessible links",
      },
      {
        key: "allowPrivateInviteSharing",
        label: "Allow invite-only sharing",
        description: "Members can share files with specific people by email",
        feature: "teamManagement",
      },
      {
        key: "enableActivityLogs",
        label: "Enable activity logs",
        description:
          "Track uploads, shares, and deletions in the activity feed",
        feature: "auditLogs",
      },
    ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Security</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure security and sharing policies.
          </p>
        </div>
        {!isAdmin && (
          <Badge variant="secondary" className="shrink-0 mt-0.5">
            View only
          </Badge>
        )}
      </div>
      <Separator />

      <div className="space-y-3">
        {ROWS.map((row) => (
          <UpgradeTooltip
            key={row.key}
            disabled={Boolean(row.feature && !workspaceFeatureAccess?.[row.feature])}
            message={row.feature ? featureUpgradeMessage(row.feature) : "Upgrade your plan to unlock this feature"}
          >
            <div
              className={cn(
                "flex items-center gap-4 rounded-lg border px-4 py-3",
                (!isAdmin || (row.feature && !workspaceFeatureAccess?.[row.feature])) && "opacity-60",
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {row.description}
                </p>
              </div>
              <Toggle
                value={sec[row.key]}
                onChange={() => toggle(row.key)}
                disabled={!isAdmin || updateSec.isPending || Boolean(row.feature && !workspaceFeatureAccess?.[row.feature])}
              />
            </div>
          </UpgradeTooltip>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Billing ──────────────────────────────────────────────────────────

function BillingSection({ workspace }: { workspace: Workspace }) {
  const { subscription, workspaceRemaining, workspacePlan } = useSubscriptionSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Billing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan and billing settings.
        </p>
      </div>
      <Separator />

      {/* Current plan */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Current plan</p>
          <p className="text-sm font-semibold">{workspace.plan}</p>
        </div>
        <Badge className={cn("ml-auto", PLAN_STYLE[workspace.plan])}>
          {workspace.plan}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm">Workspace seats</CardTitle>
            <CardDescription>
              {workspaceRemaining?.teamMembers === null
                ? "Unlimited members"
                : `${workspaceRemaining?.teamMembers ?? 0} seats remaining`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 text-[11px] text-muted-foreground">
            Active and pending invites both count toward your current workspace quota.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm">Share links</CardTitle>
            <CardDescription>
              {workspaceRemaining?.activeShareLinks === null
                ? "Unlimited active links"
                : `${workspaceRemaining?.activeShareLinks ?? 0} links remaining`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 text-[11px] text-muted-foreground">
            Password-protected and private links unlock on higher plans.
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm">Upgrade workspace</CardTitle>
            <CardDescription>
              Current workspace plan: {planDisplayName(workspacePlan)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <Button asChild size="sm" className="w-full">
              <a href="/app/billing">
                {workspace.plan === "Team" ? "Manage billing" : "Compare plans"}
              </a>
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Billing changes are handled from the subscription page and apply to future access checks immediately after webhook sync.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage billing note */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="mt-0.5 size-4 shrink-0 text-blue-500"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              No storage charges from BringBucket
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Storage and bandwidth costs are billed directly by your connected
              cloud provider ({workspace.storage?.name ?? "your provider"}). BringBucket only charges for platform access.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <HugeiconsIcon
          icon={UserCircle02Icon}
          className="size-3.5"
          strokeWidth={1.5}
        />
        Billing owner:{" "}
        <span className="font-medium text-foreground">{workspace.owner}</span>
      </div>
      {subscription?.status && subscription.status !== "active" ? (
        <p className="text-[11px] text-amber-600">
          Subscription status: {subscription.status}. Access can change if the subscription expires or remains past due.
        </p>
      ) : null}
    </div>
  );
}

// ─── Section: Danger Zone ──────────────────────────────────────────────────────

function DangerSection({ workspace }: { workspace: Workspace }) {
  const { data: session } = useSession();
  const { data: members = [] } = useMembers(workspace.id);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState("");

  const deleteWs = useDeleteWorkspace(workspace.id);
  const transferWs = useTransferOwnership(workspace.id);

  const transferCandidates = members.filter(
    (m) => m.userId !== session?.user.id && m.role !== "Owner",
  );

  const handleDelete = () => {
    if (deleteInput !== workspace.name) return;
    deleteWs.mutate();
  };

  const handleTransfer = () => {
    if (!newOwnerId) return;
    transferWs.mutate(newOwnerId, {
      onSuccess: () => {
        setTransferOpen(false);
        setNewOwnerId("");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Danger Zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Irreversible actions — proceed with caution.
        </p>
      </div>
      <Separator />

      <div className="space-y-3">
        {/* Transfer ownership */}
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">Transfer ownership</p>
              <p className="text-[11px] text-muted-foreground">
                Assign ownership to another member. You will become an Admin.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTransferOpen((v) => !v)}
            >
              Transfer
            </Button>
          </div>

          {transferOpen && (
            <div className="border-t border-destructive/20 pt-3 space-y-3">
              {transferCandidates.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No other active members to transfer to.
                </p>
              ) : (
                <>
                  <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select new owner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {transferCandidates.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          {m.user.name} ({m.user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10"
                      disabled={!newOwnerId || transferWs.isPending}
                      onClick={handleTransfer}
                    >
                      {transferWs.isPending
                        ? "Transferring…"
                        : "Confirm transfer"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTransferOpen(false);
                        setNewOwnerId("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Delete workspace */}
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Delete workspace
              </p>
              <p className="text-[11px] text-muted-foreground">
                Permanently delete <strong>{workspace.name}</strong> and all its
                data. This cannot be undone.
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <HugeiconsIcon
                icon={Delete01Icon}
                className="size-3.5"
                strokeWidth={1.5}
              />
              Delete workspace
            </Button>
          </div>

          {confirmDelete && (
            <div className="mt-4 space-y-3 border-t border-destructive/20 pt-4">
              <p className="text-xs text-muted-foreground">
                Type{" "}
                <strong className="text-foreground">{workspace.name}</strong> to
                confirm.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={workspace.name}
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={
                    deleteInput !== workspace.name || deleteWs.isPending
                  }
                  onClick={handleDelete}
                >
                  {deleteWs.isPending ? "Deleting…" : "Confirm"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteInput("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const router = useRouter();
  const { workspaces } = useWorkspace();
  const { data: session } = useSession();

  const workspace = workspaces.find((w) => w.id === workspaceId);
  const [section, setSection] = useState<Section>("overview");

  // Derive role from the workspace's members list (already in context)
  const myMember = workspace?.members.find(
    (m) => m.userId === session?.user.id,
  );
  const isAdmin = myMember?.role === "Owner" || myMember?.role === "Admin";

  if (!workspace) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Workspace not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="size-4"
            strokeWidth={2}
          />
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-md text-xs font-bold text-white",
              workspace.color,
            )}
          >
            {workspace.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">
              {workspace.name}
            </h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Workspace Settings
            </p>
          </div>
        </div>
        <Badge className={cn("ml-2", PLAN_STYLE[workspace.plan])}>
          {workspace.plan}
        </Badge>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Left nav */}
        <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-44 lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                s.id === "danger" &&
                  "mt-0 lg:mt-auto text-destructive hover:bg-destructive/10",
                s.id !== "danger" &&
                  (section === s.id
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"),
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {section === "overview" && <OverviewSection workspace={workspace} />}
          {section === "general" && <GeneralSection workspace={workspace} />}
          {section === "members" && (
            <MembersSection workspace={workspace} isAdmin={isAdmin} />
          )}
          {section === "storage" && <StorageSection workspace={workspace} />}
          {section === "permissions" && (
            <PermissionsSection workspace={workspace} isAdmin={isAdmin} />
          )}
          {section === "security" && (
            <SecuritySection workspace={workspace} isAdmin={isAdmin} />
          )}
          {section === "billing" && <BillingSection workspace={workspace} />}
          {section === "danger" && <DangerSection workspace={workspace} />}
        </div>
      </div>
    </div>
  );
}
