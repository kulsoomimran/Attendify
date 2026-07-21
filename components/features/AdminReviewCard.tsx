"use client";

import { useState } from "react";
import { formatDate } from "@/lib/date-utils";
import { Check, X, Loader2, Calendar, FileText, User } from "lucide-react";
import { LeaveStatus } from "@prisma/client";
import { reviewLeaveRequestAction } from "@/server/actions/leave-actions";

interface AdminReviewCardProps {
  request: {
    id: string;
    type: string;
    status: LeaveStatus;
    startDate: Date | string;
    endDate: Date | string;
    reason: string | null;
    createdAt: Date | string;
    employee: {
      department: string | null;
      user: {
        name: string;
        email: string;
      };
    };
  };
  onReviewSuccess: () => void;
}

export default function AdminReviewCard({
  request,
  onReviewSuccess,
}: AdminReviewCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const calculateDays = (start: Date | string, end: Date | string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = e.getTime() - s.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = calculateDays(request.startDate, request.endDate);

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

  const handleReview = async (newStatus: LeaveStatus) => {
    if (newStatus === LeaveStatus.APPROVED) {
      setIsApproving(true);
    } else {
      setIsRejecting(true);
    }
    setErrorMsg("");

    try {
      const result = await reviewLeaveRequestAction({
        requestId: request.id,
        status: newStatus,
      });

      if (result.success) {
        onReviewSuccess();
      } else {
        setErrorMsg(result.error || "Failed to update leave request.");
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-xl shadow-soft p-5 space-y-4 hover:border-accent-sage/35 transition-all duration-200"
      id={`leave-request-card-${request.id}`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-accent-sage" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate">{request.employee.user.name}</h4>
            <span className="text-[10px] text-secondary font-normal block mt-0.5 truncate">
              {request.employee.department || "No Department"} • {request.employee.user.email}
            </span>
          </div>
        </div>

        <span className="text-[10px] text-secondary font-mono shrink-0">
          Submitted {formatDate(request.createdAt, "MMM dd, yyyy")}
        </span>
      </div>

      {/* Leave Details */}
      <div className="bg-background/40 border border-border/60 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block">Category</span>
          <span className="text-xs font-normal text-foreground mt-0.5 block">{getLeaveTypeLabel(request.type)}</span>
        </div>
        <div>
          <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block">Duration</span>
          <span className="text-xs font-normal text-foreground mt-0.5 block">
            {days} {days === 1 ? "day" : "days"} ({formatDate(request.startDate, "MM/dd")} - {formatDate(request.endDate, "MM/dd")})
          </span>
        </div>
      </div>

      {/* Reason */}
      {request.reason && (
        <div className="flex gap-2 text-xs font-normal text-secondary">
          <FileText className="w-4 h-4 text-secondary/60 shrink-0 mt-0.5" />
          <p className="italic">{request.reason}</p>
        </div>
      )}

      {errorMsg && (
        <div className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200" id={`leave-request-error-${request.id}`}>
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      {request.status === LeaveStatus.PENDING ? (
        <div className="pt-2 border-t border-border flex justify-end gap-3">
          <button
            onClick={() => handleReview(LeaveStatus.REJECTED)}
            disabled={isApproving || isRejecting}
            className="px-3 py-1.5 border border-border hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-lg text-xs font-medium text-secondary transition-all flex items-center gap-1.5"
            id={`btn-reject-${request.id}`}
          >
            {isRejecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            Reject
          </button>
          
          <button
            onClick={() => handleReview(LeaveStatus.APPROVED)}
            disabled={isApproving || isRejecting}
            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            id={`btn-approve-${request.id}`}
          >
            {isApproving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Approve
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
          <span className="text-secondary">Status:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              request.status === LeaveStatus.APPROVED
                ? "bg-accent-sage/10 text-primary border-accent-sage/20"
                : "bg-red-50/50 text-red-700 border-red-200/50"
            }`}
          >
            {request.status}
          </span>
        </div>
      )}
    </div>
  );
}
