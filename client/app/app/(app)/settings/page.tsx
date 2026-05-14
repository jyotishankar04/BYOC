"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserCircle02Icon,
  Settings01Icon,
  LockedIcon,
  Delete01Icon,
  EyeIcon,
  Login03Icon,
  Mail01Icon,
  ComputerIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";
import {
  useConnectedAccounts,
  useRevokeOtherSessions,
  useRevokeSession,
  useUpdateUserPreferences,
  useUpdateUserProfile,
  useUserPreferences,
  useUserSessions,
  type ConnectedAccount,
  type UserSession,
} from "@/lib/user-settings";

type Section =
  | "account"
  | "profile"
  | "security"
  | "danger"
  | "appearance"
  | "privacy"
  | "sessions";

  
const SECTIONS: Array<{
  id: Section;
  label: string;
  icon: typeof Settings01Icon;
}> = [
  { id: "account", label: "Account", icon: Settings01Icon },
  { id: "profile", label: "Profile", icon: UserCircle02Icon },
  { id: "security", label: "Security", icon: LockedIcon },
  { id: "appearance", label: "Appearance", icon: EyeIcon },
  { id: "privacy", label: "Privacy", icon: EyeIcon },
  { id: "sessions", label: "Sessions", icon: Login03Icon },
  { id: "danger", label: "Danger Zone", icon: Delete01Icon },
];

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sessionLabel(session: UserSession) {
  const agent = session.userAgent ?? "";
  if (!agent) return "Unknown device";
  if (agent.includes("Chrome")) return "Chrome session";
  if (agent.includes("Safari") && !agent.includes("Chrome")) return "Safari session";
  if (agent.includes("Firefox")) return "Firefox session";
  if (agent.includes("Edg")) return "Edge session";
  return "Browser session";
}

function providerLabel(account: ConnectedAccount) {
  return account.providerId.charAt(0).toUpperCase() + account.providerId.slice(1);
}

function AccountSection() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Account"
        description="Primary account identity for your BYOC login across all workspaces."
      />
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Primary email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon icon={Mail01Icon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <span>{user.email}</span>
            </div>
            <Badge className={user.emailVerified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
              {user.emailVerified ? "Verified" : "Unverified"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Account created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This identity is shared across all your workspaces.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Onboarding status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={user.onboarded ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"}>
              {user.onboarded ? "Completed" : "Pending"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              Workspace-specific configuration belongs in each workspace settings screen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { data: session, refresh } = useSession();
  const updateProfile = useUpdateUserProfile();
  const user = session?.user;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setUsername(user.username ?? "");
    setBio(user.bio ?? "");
    setLocation(user.location ?? "");
    setWebsite(user.website ?? "");
  }, [user]);

  if (!user) return null;

  const initials = (name || user.name || "U")
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dirty =
    name !== (user.name ?? "") ||
    username !== (user.username ?? "") ||
    bio !== (user.bio ?? "") ||
    location !== (user.location ?? "") ||
    website !== (user.website ?? "");

  async function handleSave() {
    await updateProfile.mutateAsync({
      name: name || undefined,
      username: username || undefined,
      bio: bio || undefined,
      location: location || undefined,
      website: website || undefined,
    });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        description="Public profile details for your primary account."
      />
      <Separator />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar className="size-20">
                <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{name || "Unnamed user"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Avatar upload is not wired yet. Profile text updates are live.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Display name</Label>
                <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-username">Username</Label>
                <Input id="profile-username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-location">Location</Label>
                <Input id="profile-location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-website">Website</Label>
                <Input id="profile-website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="profile-bio">Bio</Label>
              <Textarea
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSave} disabled={!dirty || updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SecuritySection() {
  const { data: session } = useSession();
  const { data: accounts = [] } = useConnectedAccounts();

  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Security"
        description="Authentication and trust settings for your primary account."
      />
      <Separator />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Sign-in method</p>
                <p className="text-xs text-muted-foreground">
                  {accounts.length > 0
                    ? accounts.map(providerLabel).join(", ")
                    : "OAuth account"}
                </p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Email verification</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
              <Badge className={session.user.emailVerified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                {session.user.emailVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Protection status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border px-4 py-3">
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="mt-1 text-xs text-muted-foreground">
                2FA is not wired in this app yet. When added, it should live here because it is account-scoped, not workspace-scoped.
              </p>
            </div>
            <div className="rounded-lg border px-4 py-3">
              <p className="text-sm font-medium">Password management</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Password changes are currently managed by your connected identity provider.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (!preferences) return;
    setTheme(preferences.theme);
    setLanguage(preferences.language);
  }, [preferences]);

  async function save() {
    await updatePreferences.mutateAsync({ theme, language });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Appearance"
        description="Visual preferences for your primary account across the app."
      />
      <Separator />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as typeof theme)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={updatePreferences.isPending}>
              {updatePreferences.isPending ? "Saving..." : "Save appearance"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrivacySection() {
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    if (!preferences) return;
    setEmailNotifications(preferences.emailNotifications);
    setPushNotifications(preferences.pushNotifications);
  }, [preferences]);

  async function save() {
    await updatePreferences.mutateAsync({
      emailNotifications,
      pushNotifications,
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Privacy"
        description="Communication and data-handling preferences for your account."
      />
      <Separator />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive email alerts tied to your account activity.
              </p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">In-app notifications</p>
              <p className="text-xs text-muted-foreground">
                Allow account-level notifications inside the application.
              </p>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
          <div className="rounded-lg border px-4 py-3">
            <p className="text-sm font-medium">Data export</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Export requests are not automated yet. This belongs in global settings because it applies to your account, not one workspace.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={updatePreferences.isPending}>
              {updatePreferences.isPending ? "Saving..." : "Save privacy"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionsSection() {
  const { data: accounts = [], isLoading: loadingAccounts } = useConnectedAccounts();
  const { data: sessions = [], isLoading: loadingSessions } = useUserSessions();
  const revokeSession = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sessions"
        description="Connected login accounts and every active session for your primary account."
      />
      <Separator />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Connected accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingAccounts ? (
              <p className="text-sm text-muted-foreground">Loading accounts...</p>
            ) : accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No connected accounts found.</p>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="rounded-lg border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{providerLabel(account)}</p>
                      <p className="truncate text-xs text-muted-foreground">{account.accountId}</p>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600">Connected</Badge>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Linked {formatDate(account.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm">Active sessions</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => revokeOthers.mutate()}
                disabled={revokeOthers.isPending}
              >
                {revokeOthers.isPending ? "Revoking..." : "Revoke all others"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingSessions ? (
              <p className="text-sm text-muted-foreground">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active sessions found.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="rounded-lg border px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={ComputerIcon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
                        <p className="text-sm font-medium">{sessionLabel(session)}</p>
                        {session.current && (
                          <Badge className="bg-emerald-500/10 text-emerald-600">Current</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {session.ipAddress || "Unknown IP"} · last active {formatDate(session.updatedAt)}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {session.userAgent || "No user agent recorded"}
                      </p>
                    </div>
                    {!session.current && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => revokeSession.mutate(session.id)}
                        disabled={revokeSession.isPending}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DangerSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Danger Zone"
        description="Primary-account actions with permanent or high-impact consequences."
      />
      <Separator />

      <div className="space-y-4">
        <Card className="border-destructive/30">
          <CardContent className="pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Sign out of this device</p>
              <p className="text-xs text-muted-foreground">
                Ends the current session for your primary account.
              </p>
            </div>
            <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => signOut()}>
              <HugeiconsIcon icon={Logout01Icon} className="size-3.5" strokeWidth={1.5} />
              Sign out
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardContent className="pt-6 flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-destructive">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Account deletion is not wired in the API yet. When implemented, it should remove your BYOC account while leaving your external storage provider untouched.
              </p>
            </div>
            <Button variant="outline" disabled className="w-fit border-destructive/30 text-destructive/60">
              Delete account unavailable
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("account");

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "") as Section;
      if (SECTIONS.some((item) => item.id === hash)) {
        setSection(hash);
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  function changeSection(next: Section) {
    setSection(next);
    window.location.hash = next;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Global Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account-scoped settings for your primary BYOC identity. Workspace-specific controls live inside each workspace settings page.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => changeSection(item.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                section === item.id
                  ? "bg-accent font-medium text-foreground"
                  : item.id === "danger"
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <HugeiconsIcon icon={item.icon} className="size-4" strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="min-w-0">
          {section === "account" && <AccountSection />}
          {section === "profile" && <ProfileSection />}
          {section === "security" && <SecuritySection />}
          {section === "danger" && <DangerSection />}
          {section === "appearance" && <AppearanceSection />}
          {section === "privacy" && <PrivacySection />}
          {section === "sessions" && <SessionsSection />}
        </main>
      </div>
    </div>
  );
}
