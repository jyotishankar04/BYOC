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
  Settings01Icon,
  Logout01Icon,
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
import { Logo } from "@/components/logo"
import { WorkspaceSwitcher } from "@/components/custom/dashboard/common/workspace-switcher"

const NAV_MAIN = [
  { label: "Dashboard",    href: "/app",            icon: DashboardSquare02Icon, exact: true  },
  { label: "Files",        href: "/app/files",      icon: Folder01Icon,          exact: false },
  { label: "Gallery",      href: "/app/gallery",    icon: Image01Icon,           exact: false },
  { label: "Documents",    href: "/app/documents",  icon: LegalDocument01Icon,   exact: false },
  { label: "Videos",       href: "/app/videos",     icon: Video01Icon,           exact: false },
  { label: "Shared Links", href: "/app/shared",     icon: LinkSquare01Icon,      exact: false },
] as const

const NAV_MANAGE = [
  { label: "Analytics",    href: "/app/analytics",    icon: Analytics01Icon, exact: false },
  { label: "Integrations", href: "/app/integrations", icon: Plug01Icon,      exact: false },
  { label: "Billing",      href: "/app/billing",      icon: CreditCardIcon,  exact: false },
  { label: "Settings",     href: "/app/settings",     icon: Settings01Icon,  exact: false },
] as const

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const router = useRouter()

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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar size="sm">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col text-left leading-none">
                    <span className="truncate text-sm font-medium">John Doe</span>
                    <span className="truncate text-xs text-muted-foreground">john@example.com</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/app/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/app/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <HugeiconsIcon icon={Logout01Icon} className="size-3.5" strokeWidth={1.5} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
