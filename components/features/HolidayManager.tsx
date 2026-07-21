"use client";

import { useState } from "react";
import { formatDate } from "@/lib/date-utils";
import { Trash2, Calendar, Loader2, Plus, Info, CheckCircle2 } from "lucide-react";
import { createHolidayAction, deleteHolidayAction } from "@/server/actions/holiday-actions";

interface Holiday {
  id: string;
  name: string;
  date: Date | string;
  description: string | null;
}

interface HolidayManagerProps {
  initialHolidays: Holiday[];
}

export default function HolidayManager({ initialHolidays }: HolidayManagerProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await createHolidayAction({
        name,
        date,
        description: description || null,
      });

      if (result.success && result.data) {
        setHolidays((prev) =>
          [...prev, result.data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
        setName("");
        setDate("");
        setDescription("");
        setSuccessMsg("Holiday successfully registered.");
      } else {
        setErrorMsg(result.error || "Failed to register holiday.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await deleteHolidayAction(id);
      if (result.success) {
        setHolidays((prev) => prev.filter((h) => h.id !== id));
        setSuccessMsg("Holiday successfully deleted.");
      } else {
        setErrorMsg(result.error || "Failed to delete holiday.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="holiday-manager-container">
      {/* Registration Form Panel */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-xl shadow-soft p-5 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Register New Holiday</h3>
            <p className="text-xs text-secondary mt-0.5">Add a national or custom company holiday to the calendar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="holiday-form-error">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-accent-sage/10 text-primary text-xs p-3 rounded-lg border border-accent-sage/20 flex items-center gap-1.5" id="holiday-form-success">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-sage" />
                {successMsg}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Holiday Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Independence Day"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                id="input-holiday-name"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Holiday Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                  id="input-holiday-date"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                placeholder="Optional notes or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all resize-none"
                id="input-holiday-desc"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-lg text-xs font-medium shadow-soft transition-all flex items-center justify-center gap-1.5"
              id="btn-holiday-submit"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Register Holiday
            </button>
          </form>
        </div>
      </div>

      {/* Holiday List Ledger */}
      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-background/50">
            <div>
              <h3 className="text-sm font-medium text-foreground">Holiday Calendar Registry</h3>
              <p className="text-xs text-secondary mt-0.5">National holidays and company-wide days off.</p>
            </div>
            <span className="text-xs font-medium text-secondary">
              {holidays.length} Registered
            </span>
          </div>

          {holidays.length === 0 ? (
            <div className="p-12 text-center text-xs text-secondary flex flex-col items-center justify-center space-y-2">
              <Info className="w-6 h-6 text-secondary/55" />
              <p>No holidays registered in the database.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {holidays.map((h) => (
                <div key={h.id} className="p-4 sm:p-5 flex items-start justify-between gap-3 hover:bg-background/20 transition-colors duration-150">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">{h.name}</h4>
                    <span className="text-xs text-accent-sage font-medium block">
                      {formatDate(h.date, "MMMM dd, yyyy")}
                    </span>
                    {h.description && (
                      <p className="text-xs text-secondary font-normal mt-1">{h.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(h.id)}
                    disabled={deletingId !== null}
                    className="p-2 border border-border hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-lg text-secondary transition-all"
                    title="Delete holiday"
                    id={`btn-delete-holiday-${h.id}`}
                  >
                    {deletingId === h.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-700" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
