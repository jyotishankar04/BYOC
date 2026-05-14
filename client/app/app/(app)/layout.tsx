import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { AppSidebar } from "@/components/custom/dashboard/common/app-sidebar";
import { TopNavbar } from "@/components/custom/dashboard/common/top-navbar";
import { FloatingUploadBar } from "@/components/custom/dashboard/common/floating-upload-bar";
import { AuthGuard } from "@/components/custom/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <WorkspaceProvider>
        <NotificationsProvider>
          <TooltipProvider>
            <SidebarProvider defaultOpen={true}>
              <AppSidebar />
              <SidebarInset>
                <TopNavbar />
                <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
              </SidebarInset>
              <FloatingUploadBar />
            </SidebarProvider>
          </TooltipProvider>
        </NotificationsProvider>
      </WorkspaceProvider>
    </AuthGuard>
  );
}
