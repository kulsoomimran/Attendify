"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Clock, Calendar } from "lucide-react";
import { createShiftAction, updateShiftAction } from "@/server/actions/shift-actions";

interface ShiftFormProps {
  shift?: any | null; // If present, we are in Edit mode. Otherwise, Create mode.
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ShiftForm({
  shift,
  isOpen,
  onClose,
  onRefresh,
}: ShiftFormProps) {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [gracePeriod, setGracePeriod] = useState<number>(15);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEdit = !!shift;

  useEffect(() => {
    if (shift) {
      setName(shift.name || "");
      setStartTime(shift.startTime || "09:00");
      setEndTime(shift.endTime || "17:00");
      setGracePeriod(shift.gracePeriod !== undefined ? shift.gracePeriod : 15);
      setErrorMsg("");
    } else {
      setName("");
      setStartTime("09:00");
      setEndTime("17:00");
      setGracePeriod(15);
      setErrorMsg("");
    }
  }, [shift, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // Validate 24h format
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      setErrorMsg("Time fields must be in HH:MM 24-hour format (e.g., 09:00, 17:30)");
      setIsLoading(false);
      return;
    }

    if (gracePeriod < 0 || !Number.isInteger(gracePeriod)) {
      setErrorMsg("Grace period must be a non-negative integer number");
      setIsLoading(false);
      return;
    }

    const data = {
      name,
      startTime,
      endTime,
      gracePeriod: Number(gracePeriod),
    };

    let result;
    if (isEdit && shift) {
      result = await updateShiftAction(shift.id, data);
    } else {
      result = await createShiftAction(data);
    }

    setIsLoading(false);

    if (result.success) {
      setName("");
      setStartTime("09:00");
      setEndTime("17:00");
      setGracePeriod(15);
      onRefresh();
      onClose();
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" id="shift-form-modal-overlay">
      <div
        className="absolute inset-0 bg-primary/25 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-elevation relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-background/50">
          <div>
            <h3 className="text-base font-normal text-foreground" id="shift-modal-title">
              {isEdit ? "Edit Shift Configuration" : "Create New Shift"}
            </h3>
            <p className="text-xs font-normal text-secondary mt-0.5">
              Define the hours and parameters for this work shift.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md border border-border text-secondary hover:text-foreground hover:bg-background transition-all"
            id="btn-close-shift-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="shift-modal-error">
              {errorMsg}
            </div>
          )}

          {/* Shift Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Shift Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Core Shift"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
              id="input-shift-name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Start Time (24h)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  required
                  placeholder="09:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                  id="input-shift-start"
                />
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">End Time (24h)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  required
                  placeholder="17:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                  id="input-shift-end"
                />
              </div>
            </div>
          </div>

          {/* Grace Period */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Grace Period <span className="text-secondary font-normal">(minutes)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
              <input
                type="number"
                required
                min={0}
                placeholder="15"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                id="input-shift-grace"
              />
            </div>
            <p className="text-[10px] text-secondary mt-1 font-normal">
              Employees can check in late up to this many minutes without being marked &quot;LATE&quot;.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-xl text-xs font-medium text-secondary hover:text-foreground hover:bg-background transition-all"
              id="btn-shift-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-xl text-xs font-medium shadow-soft transition-all flex items-center gap-1.5"
              id="btn-shift-submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
