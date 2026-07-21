"use client";

import { useEffect, useState } from "react";
import { formatDate, isAfterDate, isTodayDate } from "@/lib/date-utils";
import { CalendarDays, Loader2, Info } from "lucide-react";

interface Holiday {
  id: string;
  name: string;
  date: string;
  description: string | null;
}

export default function HolidayAlertWidget() {
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const response = await fetch("/api/v1/holidays");
        const result = await response.json();
        if (response.ok && result.success) {
          const allHolidays = result.data as Holiday[];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Filter holidays to only upcoming ones (today or future)
          const filtered = allHolidays
            .filter((h) => {
              const hDate = new Date(h.date);
              return isAfterDate(hDate, today) || isTodayDate(hDate);
            })
            // Take the next 3 upcoming holidays
            .slice(0, 3);

          setUpcomingHolidays(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch holidays for widget", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHolidays();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-soft p-5 flex items-center justify-center gap-2 text-xs text-secondary min-h-[140px]" id="holiday-widget-loading">
        <Loader2 className="w-4 h-4 animate-spin text-accent-sage" />
        <span>Loading upcoming holidays...</span>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft p-5 space-y-4" id="holiday-widget-container">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-accent-sage" />
          <h3 className="text-sm font-medium text-foreground">Upcoming Holidays</h3>
        </div>
        <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider">Company Calendar</span>
      </div>

      {upcomingHolidays.length === 0 ? (
        <div className="text-center py-6 text-xs text-secondary flex flex-col items-center justify-center gap-1.5">
          <Info className="w-5 h-5 text-secondary/50" />
          <p>No upcoming holidays scheduled.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {upcomingHolidays.map((holiday) => {
            const dateObj = new Date(holiday.date);
            return (
              <div key={holiday.id} className="flex justify-between items-start gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-foreground block">
                    {holiday.name}
                  </span>
                  {holiday.description && (
                    <span className="text-[11px] text-secondary font-normal block leading-normal">
                      {holiday.description}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-accent-sage block">
                    {formatDate(dateObj, "MMM dd")}
                  </span>
                  <span className="text-[10px] text-secondary font-normal block">
                    {formatDate(dateObj, "yyyy")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
