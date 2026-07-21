"use client";

import { useState, useEffect } from "react";
import { Clock, Navigation, CheckCircle, ArrowRightLeft, FileText } from "lucide-react";
import VerificationOverlay from "./VerificationOverlay";

interface ClockPanelProps {
  todayLog: any | null; // Current day's AttendanceLog or null
  shift: any | null;    // Employee's Shift object or null
  isRemote?: boolean;   // Whether the employee is fully remote
  onRefresh: () => void;
}

export default function ClockPanel({
  todayLog,
  shift,
  isRemote = false,
  onRefresh,
}: ClockPanelProps) {
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Ticking clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDateString(now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isClockedIn = !!todayLog;
  const isClockedOut = !!todayLog?.clockOut;

  const handleClockConfirm = async (data: { latitude?: number; longitude?: number; notes?: string }) => {
    setIsSubmitting(true);
    setErrorMsg("");

    const url = isClockedIn ? "/api/v1/attendance/clock-out" : "/api/v1/attendance/clock-in";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onRefresh();
        setIsVerificationOpen(false);
      } else {
        setErrorMsg(result.error || "Failed to record attendance. Please try again.");
      }
    } catch (error) {
      setErrorMsg("Network error occurred. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine button state
  let buttonLabel = "Clock In";
  let buttonDisabled = false;
  let statusBanner = "You are currently not checked in today.";

  if (isClockedIn) {
    buttonLabel = "Clock Out";
    statusBanner = `Clocked In at ${new Date(todayLog.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (isClockedOut) {
    buttonLabel = "Completed";
    buttonDisabled = true;
    statusBanner = `Shift complete. Clocked Out at ${new Date(todayLog.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft p-6 flex flex-col space-y-6" id="clock-panel-root">
      
      {/* Ticking Clock Layout */}
      <div className="flex flex-col items-center text-center space-y-2 py-4 border-b border-border">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary" id="clock-date">
          {dateString || "Loading date..."}
        </span>
        <span className="text-4xl font-light tracking-tight text-foreground font-mono" id="clock-time">
          {timeString || "00:00:00"}
        </span>
        
        {/* Assigned Shift details badge */}
        {shift ? (
          <span className="inline-flex items-center gap-1 text-foreground bg-background border border-border px-2.5 py-0.5 rounded-lg text-[10px] font-normal shadow-soft" id="clock-shift-badge">
            <Clock className="w-3 h-3 text-secondary" />
            {shift.name} ({shift.startTime} – {shift.endTime})
          </span>
        ) : (
          <span className="text-[10px] text-secondary italic">No shift assigned</span>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 text-center" id="clock-panel-error">
          {errorMsg}
        </div>
      )}

      {/* Clocking Actions Control bar */}
      <div className="flex flex-col items-center space-y-4">
        
        {/* Status Indicator text */}
        <span className="text-xs text-secondary text-center font-normal" id="clock-status-banner">
          {statusBanner}
        </span>

        {/* Core Clocking Toggle button (Stripe-styled solid fill or disabled outline) */}
        {!buttonDisabled ? (
          <button
            onClick={() => setIsVerificationOpen(true)}
            className="w-full max-w-xs py-3 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-xl text-xs font-semibold shadow-soft transition-all duration-200 flex items-center justify-center gap-2"
            id="btn-clock-action"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {buttonLabel}
          </button>
        ) : (
          <button
            disabled
            className="w-full max-w-xs py-3 border border-border bg-background text-secondary rounded-xl text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            id="btn-clock-action-disabled"
          >
            <CheckCircle className="w-4 h-4 text-accent-sage" />
            {buttonLabel}
          </button>
        )}
      </div>

      {/* Verification Overlay sheet instantiation */}
      <VerificationOverlay
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        isClockOut={isClockedIn && !isClockedOut}
        isRemote={isRemote}
        onConfirm={handleClockConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
