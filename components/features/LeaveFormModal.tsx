"use client";

import { useState } from "react";
import { X, Loader2, Calendar, FileText, Activity } from "lucide-react";
import { LeaveType } from "@prisma/client";

interface LeaveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function LeaveFormModal({
  isOpen,
  onClose,
  onRefresh,
}: LeaveFormModalProps) {
  const [type, setType] = useState<LeaveType>(LeaveType.ANNUAL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setErrorMsg("End date must be on or after start date.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/v1/leave/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          startDate,
          endDate,
          reason: reason || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStartDate("");
        setEndDate("");
        setReason("");
        setType(LeaveType.ANNUAL);
        onRefresh();
        onClose();
      } else {
        setErrorMsg(result.error || "Failed to submit leave request.");
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" id="leave-request-modal-overlay">
      <div
        className="absolute inset-0 bg-primary/25 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-elevation relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-background/50">
          <div>
            <h3 className="text-base font-normal text-foreground" id="leave-modal-title">Request Time Off</h3>
            <p className="text-xs font-normal text-secondary mt-0.5">Submit a new leave request for administrative review.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md border border-border text-secondary hover:text-foreground hover:bg-background transition-all"
            id="btn-close-leave-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="leave-modal-error">
              {errorMsg}
            </div>
          )}

          {/* Leave Type */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Leave Category</label>
            <div className="relative">
              <Activity className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LeaveType)}
                className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all appearance-none"
                id="select-leave-type"
              >
                <option value={LeaveType.ANNUAL}>Annual Leave</option>
                <option value={LeaveType.SICK}>Sick Leave</option>
                <option value={LeaveType.CASUAL}>Casual Leave</option>
                <option value={LeaveType.MATERNITY}>Maternity Leave</option>
                <option value={LeaveType.UNPAID}>Unpaid Leave</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                  id="input-leave-start-date"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                  id="input-leave-end-date"
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Reason / Comments</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
              <textarea
                placeholder="Explain the reason for this time off request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all resize-none"
                id="input-leave-reason"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-xl text-xs font-medium text-secondary hover:text-foreground hover:bg-background transition-all"
              id="btn-leave-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-xl text-xs font-medium shadow-soft transition-all flex items-center gap-1.5"
              id="btn-leave-submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
