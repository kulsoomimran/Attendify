"use client";

import { AttendanceStatus } from "@prisma/client";
import { Clock, FileText, Laptop, MapPin, Navigation } from "lucide-react";


interface AttendanceTimelineProps {
  logs: any[];
}

/** Detect work mode from the notes field set by VerificationOverlay */
function detectMode(notes: string | null): "remote" | "onsite" | null {
  if (!notes) return null;
  if (notes.includes("Remote Verification")) return "remote";
  if (notes.includes("Onsite Verification")) return "onsite";
  return null;
}

export default function AttendanceTimeline({ logs }: AttendanceTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-soft p-8 text-center" id="timeline-empty">
        <p className="text-xs text-secondary font-normal">No attendance history logs recorded yet.</p>
      </div>
    );
  }

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-accent-sage/10 border border-accent-sage/20 px-2 py-0.5 rounded-full text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-sage" />
            Present
          </span>
        );
      case AttendanceStatus.LATE:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded-full text-yellow-800">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Late Arrival
          </span>
        );
      case AttendanceStatus.ABSENT:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-red-50 border border-red-100 px-2 py-0.5 rounded-full text-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-background border border-border px-2 py-0.5 rounded-full text-secondary">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft p-5 space-y-4" id="attendance-timeline-root">
      <div className="border-b border-border pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Attendance Ledger</h3>
          <p className="text-[11px] text-secondary mt-0.5">Chronological log of clock actions, location, and notes.</p>
        </div>
      </div>

      <div className="flow-root" id="timeline-list">
        <ul className="-mb-8">
          {logs.map((log, idx) => {
            const formattedDate = new Date(log.date).toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const clockInTime = new Date(log.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const clockOutTime = log.clockOut
              ? new Date(log.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : null;

            const mode = detectMode(log.notes);
            const hasCoords = log.latitudeIn !== null && log.latitudeIn !== undefined;

            return (
              <li key={log.id} id={`timeline-item-${log.id}`}>
                <div className="relative pb-8">
                  {/* Connective line */}
                  {idx !== logs.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                  ) : null}

                  <div className="relative flex space-x-3">
                    {/* Circle icon — colour-coded by mode */}
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                        mode === "remote"
                          ? "bg-blue-50 border-blue-100"
                          : mode === "onsite"
                            ? "bg-accent-sage/10 border-accent-sage/20"
                            : "bg-background border-border"
                      }`}>
                        {mode === "remote"
                          ? <Laptop className="w-3.5 h-3.5 text-blue-500" />
                          : mode === "onsite"
                            ? <MapPin className="w-3.5 h-3.5 text-accent-sage" />
                            : <Clock className="w-3.5 h-3.5 text-secondary" />
                        }
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1 flex flex-col md:flex-row justify-between md:items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{formattedDate}</span>
                          {getStatusBadge(log.status)}
                          {/* Work mode chip */}
                          {mode === "remote" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-blue-600" id={`mode-chip-${log.id}`}>
                              <Laptop className="w-2.5 h-2.5" />
                              Remote
                            </span>
                          )}
                          {mode === "onsite" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-accent-sage/10 border border-accent-sage/20 px-1.5 py-0.5 rounded text-accent-sage" id={`mode-chip-${log.id}`}>
                              <MapPin className="w-2.5 h-2.5" />
                              Onsite
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-secondary font-normal flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-foreground">In:</span> {clockInTime}
                          </span>
                          {clockOutTime && (
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-foreground">Out:</span> {clockOutTime}
                            </span>
                          )}
                          {log.workingHours !== null && (
                            <span className="flex items-center gap-1 font-semibold text-foreground bg-background border border-border px-1.5 py-0.5 rounded">
                              {log.workingHours} hrs worked
                            </span>
                          )}
                          {log.lateMinutes > 0 && (
                            <span className="text-red-600 font-medium">
                              {log.lateMinutes} mins late
                            </span>
                          )}
                        </div>

                        {/* Geolocation coords (onsite only) */}
                        {hasCoords && mode === "onsite" && (
                          <div className="text-[10px] bg-background border border-border rounded px-2.5 py-1.5 flex items-center gap-1.5 font-mono text-secondary mt-1 w-full sm:w-fit overflow-hidden" id={`coords-${log.id}`}>
                            <Navigation className="w-2.5 h-2.5 shrink-0 text-accent-sage" />
                            <span className="truncate">{Number(log.latitudeIn).toFixed(5)}, {Number(log.longitudeIn).toFixed(5)}</span>
                          </div>
                        )}

                        {log.notes && (
                          <div className="text-[11px] bg-background border border-border rounded-lg p-2.5 mt-1.5 flex items-start gap-1.5 w-full font-normal text-secondary">
                            <FileText className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                            <span className="wrap-break-word min-w-0">{log.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
