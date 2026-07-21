"use client";

import { LeaveRequest } from "@prisma/client";
import { formatDate } from "@/lib/date-utils";
import { CalendarRange, Inbox } from "lucide-react";

interface LeaveHistoryTableProps {
  leaveRequests: LeaveRequest[];
  isLoading: boolean;
}

export default function LeaveHistoryTable({
  leaveRequests,
  isLoading,
}: LeaveHistoryTableProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-accent-sage/10 text-primary border-accent-sage/20";
      case "REJECTED":
        return "bg-red-50/50 text-red-700 border-red-200/50";
      default:
        return "bg-background text-secondary border-border";
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case "ANNUAL":
        return "Annual Leave";
      case "SICK":
        return "Sick Leave";
      case "CASUAL":
        return "Casual Leave";
      case "MATERNITY":
        return "Maternity Leave";
      case "UNPAID":
        return "Unpaid Leave";
      default:
        return type;
    }
  };

  const calculateDays = (start: Date | string, end: Date | string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = e.getTime() - s.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden" id="leave-history-container">
      {/* Header */}
      <div className="px-4 sm:px-6 py-5 border-b border-border flex items-center justify-between bg-background/50">
        <div>
          <h3 className="text-base font-normal text-foreground">Time-Off Requests Ledger</h3>
          <p className="text-xs font-normal text-secondary mt-0.5">Historical overview of your submitted leave applications.</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
          <CalendarRange className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {/* Table / Content */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-secondary flex items-center justify-center gap-2" id="leave-table-loading">
          <span className="w-4 h-4 border-2 border-accent-sage border-t-transparent rounded-full animate-spin" />
          Loading request ledger...
        </div>
      ) : leaveRequests.length === 0 ? (
        <div className="p-12 text-center text-xs text-secondary flex flex-col items-center justify-center space-y-3" id="leave-table-empty">
          <Inbox className="w-8 h-8 text-secondary/60" />
          <p>No leave requests found.</p>
        </div>
      ) : (
        <>
          {/* Mobile card list — visible below md */}
          <div className="md:hidden divide-y divide-border">
            {leaveRequests.map((req) => {
              const days = calculateDays(req.startDate, req.endDate);
              return (
                <div key={req.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{getLeaveTypeLabel(req.type)}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyle(req.status)} shrink-0`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary">
                    <span>{formatDate(req.startDate, "MMM dd, yyyy")} – {formatDate(req.endDate, "MMM dd, yyyy")}</span>
                    <span className="font-medium text-foreground">{days} {days === 1 ? "day" : "days"}</span>
                  </div>
                  {req.reason && (
                    <p className="text-xs text-secondary italic truncate" title={req.reason || undefined}>{req.reason}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table — hidden below md */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse" id="leave-history-table">
              <thead>
                <tr className="border-b border-border bg-background/20">
                  <th className="px-6 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">Leave Category</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-secondary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaveRequests.map((req) => {
                  const days = calculateDays(req.startDate, req.endDate);
                  return (
                    <tr key={req.id} className="hover:bg-background/30 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {getLeaveTypeLabel(req.type)}
                      </td>
                      <td className="px-6 py-4 text-sm font-normal text-secondary">
                        {formatDate(req.startDate, "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-sm font-normal text-secondary">
                        {formatDate(req.endDate, "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-sm font-normal text-secondary">
                        {days} {days === 1 ? "day" : "days"}
                      </td>
                      <td className="px-6 py-4 text-sm font-normal text-secondary max-w-xs truncate" title={req.reason || undefined}>
                        {req.reason || <span className="italic text-secondary/50">No reason specified</span>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyle(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
