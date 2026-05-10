import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { WorkspaceProvider } from "@/lib/workspace-context"
import { AppSidebar } from "@/components/custom/dashboard/common/app-sidebar"
import { TopNavbar } from "@/components/custom/dashboard/common/top-navbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <TooltipProvider>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <TopNavbar />
            <div className="flex flex-1 flex-col gap-6 p-6">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </WorkspaceProvider>
  )
}
