"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, Calendar, Sparkles } from "lucide-react";
import LeaveFormModal from "@/components/features/LeaveFormModal";
import LeaveHistoryTable from "@/components/features/LeaveHistoryTable";

export default function EmployeeLeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLeaveRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/v1/leave/request");
      const result = await response.json();
      if (response.ok && result.success) {
        setLeaveRequests(result.data);
      } else {
        setErrorMsg(result.error || "Failed to load leave history.");
      }
    } catch (err) {
      setErrorMsg("A network error occurred while updating leave ledger.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  // Compute leave balance metrics
  const annualAllowance = 20;
  const approvedLeaves = leaveRequests.filter(req => req.status === "APPROVED");
  const pendingLeaves = leaveRequests.filter(req => req.status === "PENDING");

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = e.getTime() - s.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalTakenDays = approvedLeaves.reduce((sum, req) => sum + calculateDays(req.startDate, req.endDate), 0);
  const totalPendingDays = pendingLeaves.reduce((sum, req) => sum + calculateDays(req.startDate, req.endDate), 0);
  const remainingDays = Math.max(0, annualAllowance - totalTakenDays);

  return (
    <div className="flex flex-col space-y-6" id="employee-leaves-root">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-border pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Time-Off Requests</span>
          <h1 className="text-xl font-normal text-foreground mt-1" id="employee-leaves-title">
            Leave & Time-Off Management
          </h1>
          <p className="text-xs font-normal text-secondary mt-0.5">
            Submit leave requests and monitor your remaining annual allowance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <button
            onClick={fetchLeaveRequests}
            className="p-2 border border-border rounded-xl text-secondary hover:text-foreground hover:bg-card transition-all duration-200"
            id="btn-refresh-employee-leaves"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-xl text-xs font-medium shadow-soft transition-all flex items-center gap-1.5"
            id="btn-new-leave-request"
          >
            <Plus className="w-3.5 h-3.5" />
            Request Time Off
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="employee-leaves-error">
          {errorMsg}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="leave-kpis">
        {/* Total Allowance */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Annual Allowance</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="stat-annual-allowance">
              {annualAllowance} days
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Calendar className="w-5 h-5 text-secondary" />
          </div>
        </div>

        {/* Days Taken */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Days Approved / Taken</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="stat-days-approved">
              {isLoading ? "..." : `${totalTakenDays} days`}
            </span>
            {totalPendingDays > 0 && (
              <span className="text-[10px] text-secondary font-normal block mt-1">({totalPendingDays} days pending)</span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
        </div>

        {/* Remaining Allowance */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs text-secondary font-normal">Remaining Balance</span>
            <span className="block text-2xl font-normal text-foreground mt-1 text-primary" id="stat-remaining-balance">
              {isLoading ? "..." : `${remainingDays} days`}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-accent-sage">{remainingDays}</span>
          </div>
        </div>
      </div>

      {/* History Ledger Table */}
      <LeaveHistoryTable
        leaveRequests={leaveRequests}
        isLoading={isLoading}
      />

      {/* Modal Dialog */}
      <LeaveFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchLeaveRequests}
      />
    </div>
  );
}
