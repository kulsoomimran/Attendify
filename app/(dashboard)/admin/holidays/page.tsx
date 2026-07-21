import { getAllHolidays } from "@/server/services/holiday-service";
import HolidayManager from "@/components/features/HolidayManager";

export const dynamic = "force-dynamic";

export default async function AdminHolidaysPage() {
  const holidays = await getAllHolidays();
  
  const formattedHolidays = holidays.map(h => ({
    id: h.id,
    name: h.name,
    date: h.date.toISOString(),
    description: h.description,
  }));

  return (
    <div className="flex flex-col space-y-6" id="admin-holidays-root">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Calendar Operations</span>
        <h1 className="text-xl font-normal text-foreground mt-1" id="admin-holidays-title">
          Holiday Registry
        </h1>
        <p className="text-xs font-normal text-secondary mt-0.5">
          Manage national holidays and corporate closures to align payroll and attendance schedules.
        </p>
      </div>

      <HolidayManager initialHolidays={formattedHolidays} />
    </div>
  );
}
