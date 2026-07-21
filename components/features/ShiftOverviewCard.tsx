"use client";

import { Calendar, Clock, AlertTriangle, BadgeCheck, Laptop, MapPin } from "lucide-react";

interface ShiftOverviewCardProps {
  shift: any | null;
  isRemote?: boolean;
}

export default function ShiftOverviewCard({ shift, isRemote = false }: ShiftOverviewCardProps) {
  if (!shift) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-soft p-5 flex flex-col items-center text-center space-y-3" id="shift-overview-empty">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Unassigned Schedule</h3>
          <p className="text-[11px] text-secondary mt-1 max-w-xs">
            You do not have a shift schedule assigned. Please contact your organization administrator.
          </p>
        </div>
      </div>
    );
  }

  // Calculate shift duration
  let durationHours = 0;
  try {
    const [startH, startM] = shift.startTime.split(":").map(Number);
    const [endH, endM] = shift.endTime.split(":").map(Number);
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60; // Handle overnight shifts
    durationHours = Math.round((diffMins / 60) * 100) / 100;
  } catch (error) {
    console.error("Failed to parse shift hours", error);
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft p-5 space-y-4" id="shift-overview-root">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-accent-sage" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Assigned Shift</h3>
            <p className="text-[11px] text-secondary mt-0.5" id="shift-name-title">{shift.name}</p>
          </div>
        </div>

        {/* Work Mode badge */}
        {isRemote ? (
          <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full text-[10px] font-medium" id="shift-work-mode-badge">
            <Laptop className="w-3 h-3" />
            Remote (WFH)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-secondary bg-background border border-border px-2.5 py-1 rounded-full text-[10px] font-normal" id="shift-work-mode-badge">
            <MapPin className="w-3 h-3" />
            Onsite
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Core Timing */}
        <div className="bg-background border border-border rounded-lg p-3">
          <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold">Work Hours</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            <span className="text-xs font-semibold text-foreground" id="shift-time-range">
              {shift.startTime} – {shift.endTime}
            </span>
          </div>
        </div>

        {/* Shift Duration */}
        <div className="bg-background border border-border rounded-lg p-3">
          <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold">Shift Duration</span>
          <div className="flex items-center gap-1.5 mt-1">
            <BadgeCheck className="w-3.5 h-3.5 text-accent-sage" />
            <span className="text-xs font-semibold text-foreground" id="shift-duration">
              {durationHours} hours
            </span>
          </div>
        </div>
      </div>

      {/* Work Mode info row */}
      <div className="bg-background border border-border rounded-lg p-3 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold block">Verification Mode</span>
          <span className="text-[11px] text-secondary mt-0.5 block">
            {isRemote
              ? "Work plan and summary required on each clock action."
              : "Geolocation check required within the office radius."}
          </span>
        </div>
        {isRemote
          ? <Laptop className="w-4 h-4 text-secondary shrink-0" />
          : <MapPin className="w-4 h-4 text-secondary shrink-0" />
        }
      </div>

      {/* Grace period details */}
      <div className="bg-background border border-border rounded-lg p-3 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold block">Grace Period Limit</span>
          <span className="text-[11px] text-secondary mt-0.5 block">Allowed late checking buffers.</span>
        </div>
        <span className="text-xs font-semibold text-foreground bg-card border border-border px-2.5 py-1 rounded-md shadow-soft" id="shift-grace-badge">
          {shift.gracePeriod} minutes
        </span>
      </div>
    </div>
  );
}
