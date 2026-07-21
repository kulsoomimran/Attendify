"use client";

import { useEffect, useState, useCallback } from "react";
import ClockPanel from "@/components/features/ClockPanel";
import ShiftOverviewCard from "@/components/features/ShiftOverviewCard";
import AttendanceCalendar from "@/components/features/AttendanceCalendar";
import AttendanceTimeline from "@/components/features/AttendanceTimeline";
import HolidayAlertWidget from "@/components/features/HolidayAlertWidget";
import { UserCheck, Clock, AlertTriangle, RefreshCw } from "lucide-react";

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<any | null>(null);
  const [todayLog, setTodayLog] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/v1/attendance/status");
      const result = await response.json();

      if (response.ok && result.success) {
        setProfile(result.data.profile);
        setTodayLog(result.data.todayLog);
        setLogs(result.data.logs);
      } else {
        setErrorMsg(result.error || "Failed to load dashboard data");
      }
    } catch (error) {
      setErrorMsg("A network error occurred while updating dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute stats
  const presentDays = logs.filter(log => log.status === "PRESENT" || log.status === "LATE").length;
  const lateArrivals = logs.filter(log => log.status === "LATE").length;
  const totalHours = logs.reduce((sum, log) => sum + (log.workingHours || 0), 0);

  return (
    <div className="flex flex-col space-y-6" id="employee-dashboard-root">
      
      {/* Page Header */}
      <div className="flex justify-between items-start gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Workforce Portal</span>
          <h1 className="text-xl font-normal text-foreground mt-1" id="employee-dashboard-title">
            Employee Workspace
          </h1>
          <p className="text-xs font-normal text-secondary mt-0.5">
            Log your shift hours and check your monthly logs ledger.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 border border-border rounded-xl text-secondary hover:text-foreground hover:bg-card transition-all duration-200 shrink-0"
          id="btn-refresh-employee-dashboard"
          title="Refresh dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="employee-dashboard-error">
          {errorMsg}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="employee-kpis">
        {/* KPI 1 */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Present Days</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="stat-present-days">
              {isLoading ? "..." : presentDays}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-accent-sage" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Late Arrivals</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="stat-late-arrivals">
              {isLoading ? "..." : lateArrivals}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-secondary" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Hours Worked</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="stat-hours-worked">
              {isLoading ? "..." : `${totalHours.toFixed(1)} hrs`}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Clock className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </div>

      {/* Main Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Check-in & Shift details) */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <ClockPanel
            todayLog={todayLog}
            shift={profile?.shift || null}
            isRemote={profile?.isRemote ?? false}
            onRefresh={fetchData}
          />
          
          <ShiftOverviewCard shift={profile?.shift || null} isRemote={profile?.isRemote ?? false} />

          <HolidayAlertWidget />
        </div>

        {/* Right Columns (Logs & Timeline) */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <AttendanceCalendar logs={logs} />
          
          <AttendanceTimeline logs={logs} />
        </div>

      </div>

    </div>
  );
}
