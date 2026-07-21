import { db } from "@/lib/db";
import { Role, LeaveStatus } from "@prisma/client";
import Link from "next/link";
import { Users, UserCheck, Calendar, ShieldAlert, Clock, ArrowRight, ArrowLeftRight } from "lucide-react";
import HolidayAlertWidget from "@/components/features/HolidayAlertWidget";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  // Query KPIs from database
  const [totalEmployees, activeEmployees, totalShifts, pendingLeaves, recentEmployees, activeShifts] = await Promise.all([
    db.user.count({
      where: { role: Role.EMPLOYEE },
    }),
    db.user.count({
      where: { role: Role.EMPLOYEE, isActive: true },
    }),
    db.shift.count(),
    db.leaveRequest.count({
      where: { status: LeaveStatus.PENDING },
    }),
    db.user.findMany({
      where: { role: Role.EMPLOYEE },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        employeeProfile: {
          include: {
            shift: true,
          },
        },
      },
    }),
    db.shift.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="flex flex-col space-y-6" id="admin-overview-root">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Control Hub</span>
        <h1 className="text-xl font-normal text-foreground mt-1" id="overview-title">Dashboard Overview</h1>
        <p className="text-xs font-normal text-secondary mt-0.5">Real-time indicators and operational management shortcuts.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="overview-kpis">
        {/* KPI 1 */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Total Employees</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="kpi-total-employees">
              {totalEmployees}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Active Staff</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="kpi-active-employees">
              {activeEmployees}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-accent-sage" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Active Shifts</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="kpi-total-shifts">
              {totalShifts}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Calendar className="w-5 h-5 text-secondary" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Pending Leaves</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="kpi-pending-leaves">
              {pendingLeaves}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main panels */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* Recent Employees Table Panel */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recent Onboardings</h3>
                  <p className="text-[11px] text-secondary">Latest staff accounts created in the system.</p>
                </div>
                <Link
                  href="/admin/employees"
                  className="text-xs text-secondary hover:text-foreground inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
                  id="link-view-all-employees"
                >
                  View Directory
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {recentEmployees.length === 0 ? (
                  <p className="text-xs text-secondary py-6 text-center">No employee profiles onboarded yet.</p>
                ) : (
                  recentEmployees.map((emp) => {
                    const initials = emp.name ? emp.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U";
                    return (
                      <div key={emp.id} className="flex items-center justify-between py-3 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center text-xs font-mono font-medium text-foreground shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold text-foreground truncate">{emp.name}</span>
                            <span className="block text-[10px] text-secondary font-normal truncate">{emp.email}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-xs text-foreground font-normal">
                            {emp.employeeProfile?.department || "General"}
                          </span>
                          <span className="block text-[9px] text-secondary">
                            {emp.employeeProfile?.shift?.name || "No Shift"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Shift Configurations Panel */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Active Work Shifts</h3>
                  <p className="text-[11px] text-secondary">Configurations dictating attendance timing rules.</p>
                </div>
                <Link
                  href="/admin/shifts"
                  className="text-xs text-secondary hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  id="link-view-all-shifts"
                >
                  Manage Shifts
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {activeShifts.length === 0 ? (
                  <p className="text-xs text-secondary py-6 text-center">No shift schedules defined yet.</p>
                ) : (
                    activeShifts.map((shift) => (
                    <div key={shift.id} className="flex flex-wrap items-center justify-between gap-2 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-foreground">{shift.name}</span>
                          <span className="block text-[10px] text-secondary font-normal">
                            Grace Period: {shift.gracePeriod} minutes
                          </span>
                        </div>
                      </div>
                      <div className="text-right bg-background border border-border px-2.5 py-1 rounded-lg shadow-soft shrink-0">
                        <span className="text-xs font-semibold text-foreground">
                          {shift.startTime} – {shift.endTime}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - sidebar widget */}
        <div className="lg:col-span-1">
          <HolidayAlertWidget />
        </div>
      </div>
    </div>
  );
}
