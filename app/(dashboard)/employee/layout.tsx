import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import EmployeeSidebar from "@/components/common/EmployeeSidebar";
import { SidebarProvider } from "@/components/common/SidebarContext";
import { DashboardContent } from "@/components/common/DashboardContent";

export const dynamic = "force-dynamic";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Enforce role guard: only allow authenticated users with EMPLOYEE role
    await validateRole([Role.EMPLOYEE]);
  } catch (error) {
    // If not authorized or token expired, redirect back to login page
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <EmployeeSidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
