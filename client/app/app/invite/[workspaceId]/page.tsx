"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Loading01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useMyInvite, useAcceptInvite, useDeclineInvite } from "@/lib/members";

// ─── Role label ────────────────────────────────────────────────────────────────

const ROLE_DESCRIPTION: Record<string, string> = {
  Owner:  "Full control over the workspace",
  Admin:  "Can manage members and settings",
  Member: "Can upload, share, and collaborate",
  Viewer: "Read-only access to files",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const { data: invite, isLoading, isError } = useMyInvite(workspaceId);
  const accept  = useAcceptInvite(workspaceId);
  const decline = useDeclineInvite(workspaceId);

  const userId = session?.user.id ?? "";

  const handleAccept = () => {
    accept.mutate(userId, {
      onSuccess: () => router.push("/app"),
    });
  };

  const handleDecline = () => {
    decline.mutate(userId, {
      onSuccess: () => router.push("/app"),
      onError: () => router.push("/app"),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <p className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          BYOC
        </p>

        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-sm">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <HugeiconsIcon
                icon={Loading01Icon}
                className="size-6 animate-spin text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
          ) : isError ? (
            <div className="px-6 py-10 text-center space-y-2">
              <p className="text-sm font-medium">Invite not found</p>
              <p className="text-xs text-muted-foreground">
                This invite may have already been accepted, revoked, or does not
                exist for your account.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/app")}
              >
                Go to dashboard
              </Button>
            </div>
          ) : !invite ? null : (
            <>
              {/* Workspace avatar + name */}
              <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6">
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-xl text-2xl font-bold text-white",
                    invite.workspace.color,
                  )}
                >
                  {invite.workspace.name.charAt(0)}
                </div>
                <div className="text-center">
                  <h1 className="text-base font-semibold">
                    {invite.workspace.name}
                  </h1>
                  {invite.invitedBy && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Invited by{" "}
                      <span className="font-medium text-foreground">
                        {invite.invitedBy.name}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Role chip */}
              <div className="mx-6 mb-6 rounded-lg border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={UserAdd01Icon}
                    className="size-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-xs font-medium">
                      Role:{" "}
                      <span className="text-foreground">{invite.role}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {ROLE_DESCRIPTION[invite.role] ?? ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t px-6 py-4">
                <Button
                  className="flex-1"
                  onClick={handleAccept}
                  disabled={accept.isPending || decline.isPending}
                >
                  {accept.isPending ? (
                    <HugeiconsIcon
                      icon={Loading01Icon}
                      className="size-3.5 animate-spin"
                      strokeWidth={2}
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="size-3.5"
                      strokeWidth={2}
                    />
                  )}
                  Accept invite
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  disabled={accept.isPending || decline.isPending}
                >
                  {decline.isPending ? (
                    <HugeiconsIcon
                      icon={Loading01Icon}
                      className="size-3.5 animate-spin"
                      strokeWidth={2}
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      className="size-3.5"
                      strokeWidth={2}
                    />
                  )}
                  Decline
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Logged-in as */}
        {session?.user && (
          <p className="text-center text-[11px] text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {session.user.email}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
