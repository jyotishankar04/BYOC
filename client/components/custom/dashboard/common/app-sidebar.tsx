"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare02Icon,
  Folder01Icon,
  Image01Icon,
  LegalDocument01Icon,
  Video01Icon,
  LinkSquare01Icon,
  Analytics01Icon,
  Plug01Icon,
  CreditCardIcon,
  CalculatorIcon,
  Settings01Icon,
  Logout01Icon,
  UserCircle02Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/common/logo"
import { WorkspaceSwitcher } from "@/components/custom/dashboard/common/workspace-switcher"
import { useSession, signOut } from "@/lib/auth-client"
import { featureUpgradeMessage, useSubscriptionSnapshot } from "@/lib/subscription"
import { UpgradeTooltip } from "@/components/custom/subscription/upgrade-tooltip"
import { cn } from "@/lib/utils"

const NAV_MAIN = [
  { label: "Dashboard",    href: "/app",            icon: DashboardSquare02Icon, exact: true  },
  { label: "Files",        href: "/app/files",      icon: Folder01Icon,          exact: false },
  { label: "Gallery",      href: "/app/gallery",    icon: Image01Icon,           exact: false },
  { label: "Documents",    href: "/app/documents",  icon: LegalDocument01Icon,   exact: false },
  { label: "Videos",       href: "/app/videos",     icon: Video01Icon,           exact: false },
  { label: "Shared Links", href: "/app/shared",     icon: LinkSquare01Icon,      exact: false },
  { label: "Notifications", href: "/app/notifications", icon: Notification01Icon, exact: false },
] as const

const NAV_MANAGE = [
  { label: "Analytics",    href: "/app/analytics",    icon: Analytics01Icon, exact: false, feature: "advancedAnalytics" as const },
  { label: "Usage & Pricing", href: "/app/usage",    icon: CalculatorIcon,  exact: false },
  { label: "Integrations", href: "/app/integrations", icon: Plug01Icon,      exact: false },
  { label: "Billing",      href: "/app/billing",      icon: CreditCardIcon,  exact: false },
] as const

type ManageNavItem = (typeof NAV_MANAGE)[number]

function hasFeature(item: ManageNavItem): item is ManageNavItem & { feature: "advancedAnalytics" } {
  return "feature" in item
}

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

function isSettingsActive(pathname: string) {
  return pathname === "/app/settings" || pathname.startsWith("/app/settings/") || pathname.startsWith("/app/workspaces/")
}

function SidebarUserMenu() {
  const { data: session } = useSession()
  const router = useRouter()

  const user = session?.user
  const userName = user?.name || "User"
  const userEmail = user?.email || ""
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar size="sm">
                <AvatarFallback className="text-[11px] font-semibold">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col text-left leading-none">
                <span className="truncate text-sm font-medium">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel className="py-2">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs font-normal text-muted-foreground">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/app/settings#profile")}>
              <HugeiconsIcon icon={UserCircle02Icon} className="mr-2 size-3.5" strokeWidth={1.5} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/app/settings")}>
              <HugeiconsIcon icon={Settings01Icon} className="mr-2 size-3.5" strokeWidth={1.5} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <HugeiconsIcon icon={Logout01Icon} className="mr-2 size-3.5" strokeWidth={1.5} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { subscription, loading } = useSubscriptionSnapshot()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-3">
        <Logo
          variant={state === "collapsed" ? "icon" : "full"}
          href="/app"
          className="px-1"
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Workspace switcher — first item in content so it collapses gracefully */}
        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <WorkspaceSwitcher />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_MAIN.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname, item.href, item.exact)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.5} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_MANAGE.map((item) => (
                <SidebarMenuItem key={item.label}>
                  {(() => {
                    const gated = hasFeature(item)
                    const disabled = Boolean(gated && !subscription?.featureAccess[item.feature]) || loading

                    return (
                  <UpgradeTooltip
                    disabled={disabled}
                    message={gated ? featureUpgradeMessage(item.feature) : ""}
                    className="w-full"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item.href, item.exact)}
                      tooltip={item.label}
                      className={cn(gated && !subscription?.featureAccess[item.feature] && "opacity-60")}
                    >
                      <Link
                        href={gated && !subscription?.featureAccess[item.feature] ? "/app/billing" : item.href}
                        aria-disabled={gated && !subscription?.featureAccess[item.feature]}
                      >
                        <HugeiconsIcon icon={item.icon} strokeWidth={1.5} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </UpgradeTooltip>
                    )
                  })()}
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isSettingsActive(pathname)}
                  tooltip="Settings"
                >
                  <Link href="/app/settings">
                    <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
