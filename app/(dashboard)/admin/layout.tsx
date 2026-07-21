import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/common/AdminSidebar";
import { SidebarProvider } from "@/components/common/SidebarContext";
import { DashboardContent } from "@/components/common/DashboardContent";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Enforce role guard: only allow authenticated users with ADMIN role
    await validateRole([Role.ADMIN]);
  } catch (error) {
    // If not authorized or token expired, redirect back to login page
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <AdminSidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
