"use client";

import { useState } from "react";
import { Calendar, Loader2, Check } from "lucide-react";

interface ShiftAssignerProps {
  employeeId: string;
  currentShiftId: string | null;
  shifts: any[];
  onAssigned: () => void;
}

export default function ShiftAssigner({
  employeeId,
  currentShiftId,
  shifts,
  onAssigned,
}: ShiftAssignerProps) {
  const [selectedShiftId, setSelectedShiftId] = useState<string>(currentShiftId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAssign = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    setErrorMsg("");

    try {
      const response = await fetch("/api/v1/admin/employees/assign-shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          shiftId: selectedShiftId || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        onAssigned();
        setTimeout(() => setIsSuccess(false), 2000);
      } else {
        setErrorMsg(result.error || "Failed to assign shift");
      }
    } catch (error) {
      setErrorMsg("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3 bg-background border border-border p-4 rounded-xl shadow-soft" id="shift-assigner-panel">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-accent-sage" />
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Quick Shift Assignment</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={selectedShiftId}
          onChange={(e) => setSelectedShiftId(e.target.value)}
          className="flex-1 bg-card border border-border px-3 py-1.5 rounded-lg text-xs text-foreground focus:outline-none focus:border-accent-sage"
          id="select-quick-shift"
          disabled={isLoading}
        >
          <option value="">No shift (Unassigned)</option>
          {shifts.map((shift) => (
            <option key={shift.id} value={shift.id}>
              {shift.name} ({shift.startTime} - {shift.endTime})
            </option>
          ))}
        </select>

        <button
          onClick={handleAssign}
          disabled={isLoading}
          className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-opacity-95 rounded-lg text-xs font-medium transition-all flex items-center gap-1 shrink-0"
          id="btn-quick-assign-shift"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isSuccess ? (
            <Check className="w-3.5 h-3.5 text-accent-sage" />
          ) : (
            "Assign"
          )}
        </button>
      </div>

      {errorMsg && (
        <span className="text-[10px] text-red-600" id="quick-assign-error">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
