"use client";

import { useState } from "react";
import { AttendanceStatus } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AttendanceCalendarProps {
  logs: any[];
}

export default function AttendanceCalendar({ logs }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Generate date array including empty slots for alignment
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null); // empty cells before the 1st
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  // Find log matching a specific date
  const findLogForDate = (date: Date) => {
    return logs.find((log) => {
      const logDate = new Date(log.date);
      return (
        logDate.getUTCFullYear() === date.getFullYear() &&
        logDate.getUTCMonth() === date.getMonth() &&
        logDate.getUTCDate() === date.getDate()
      );
    });
  };

  // Get styling based on attendance status
  const getCellClasses = (date: Date | null) => {
    if (!date) return "bg-transparent border-transparent cursor-default";

    const baseClass = "aspect-square w-full flex flex-col items-center justify-center rounded-lg sm:rounded-xl border border-border text-[10px] sm:text-xs transition-colors select-none";
    const log = findLogForDate(date);

    if (!log) {
      // Check if it is a weekend
      const day = date.getDay();
      if (day === 0 || day === 6) {
        return `${baseClass} bg-background text-secondary border-dashed opacity-50`;
      }
      // Past day with no logs (unmarked or absent)
      const today = new Date();
      today.setHours(0,0,0,0);
      if (date.getTime() < today.getTime()) {
        return `${baseClass} bg-background hover:bg-background/80 text-secondary`;
      }
      return `${baseClass} bg-card hover:bg-background text-foreground`;
    }

    switch (log.status) {
      case AttendanceStatus.PRESENT:
        return `${baseClass} bg-accent-sage/20 border-accent-sage/40 text-foreground font-medium`;
      case AttendanceStatus.LATE:
        return `${baseClass} bg-yellow-50 border-yellow-200 text-yellow-800 font-medium`;
      case AttendanceStatus.ABSENT:
        return `${baseClass} bg-red-50 border-red-200 text-red-800 font-medium`;
      default:
        return `${baseClass} bg-background text-foreground`;
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft p-5 space-y-4" id="attendance-calendar-root">
      
      {/* Calendar Header with Navigation */}
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Attendance Grid</h3>
          <p className="text-[11px] text-secondary mt-0.5" id="calendar-month-indicator">
            {monthNames[month]} {year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 border border-border rounded-lg text-secondary hover:text-foreground hover:bg-background transition-all"
            id="btn-calendar-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 border border-border rounded-lg text-secondary hover:text-foreground hover:bg-background transition-all"
            id="btn-calendar-next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[9px] sm:text-[10px] font-semibold text-secondary uppercase tracking-wider">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2" id="calendar-days-grid">
        {calendarCells.map((date, idx) => (
          <div
            key={idx}
            className={getCellClasses(date)}
            id={date ? `cal-cell-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` : `cal-cell-empty-${idx}`}
          >
            {date ? date.getDate() : ""}
          </div>
        ))}
      </div>

      {/* Legend Block */}
      <div className="pt-3 border-t border-border flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-secondary font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-accent-sage/20 border border-accent-sage/40" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-yellow-50 border border-yellow-200" />
          <span>Late</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-red-50 border border-red-200" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-background border border-dashed border-border" />
          <span>Weekend</span>
        </div>
      </div>

    </div>
  );
}
