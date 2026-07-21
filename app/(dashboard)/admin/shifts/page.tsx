"use client";

import { useEffect, useState, useCallback } from "react";
import ShiftForm from "@/components/features/ShiftForm";
import { deleteShiftAction } from "@/server/actions/shift-actions";
import { Calendar, Clock, Edit2, Trash2, Plus, RefreshCw, AlertCircle } from "lucide-react";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/v1/admin/shifts");
      const result = await response.json();
      if (response.ok && result.success) {
        setShifts(result.data);
      } else {
        setErrorMsg(result.error || "Failed to load shift configurations");
      }
    } catch (error) {
      setErrorMsg("A network error occurred while fetching shifts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleEditClick = (shift: any) => {
    setSelectedShift(shift);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedShift(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete shift "${name}"? Employees assigned to this shift will be unassigned.`)) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await deleteShiftAction(id);
      if (result.success) {
        fetchShifts();
      } else {
        setErrorMsg(result.error || "Failed to delete shift");
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMsg("Failed to delete shift due to a network error");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6" id="shifts-page-root">
      {/* Top Breadcrumb/Header Panel */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-border pb-5">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Admin Controls</span>
          <h1 className="text-xl font-normal text-foreground mt-1" id="shifts-page-title">Shift Configurations</h1>
          <p className="text-xs font-normal text-secondary mt-0.5">Manage work hours, core timing, and grace periods for staff members.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchShifts}
            className="p-2 border border-border rounded-xl text-secondary hover:text-foreground hover:bg-card transition-all duration-200"
            id="btn-refresh-shifts"
            title="Refresh shifts list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-opacity-95 rounded-xl text-xs font-medium shadow-soft transition-all flex items-center gap-1.5"
            id="btn-create-shift-trigger"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Shift
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 flex items-center gap-2" id="shifts-page-error">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Shifts List Canvas */}
      <div className="relative min-h-[200px]">
        {isLoading && shifts.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl" id="shifts-loading-state">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-accent-sage" />
              <span className="text-xs text-secondary">Loading shift structures...</span>
            </div>
          </div>
        ) : null}

        {/* Mobile Card View — visible below md */}
        <div className="md:hidden bg-card border border-border rounded-xl shadow-soft overflow-hidden">
          {shifts.length === 0 ? (
            <p className="px-4 py-12 text-center text-xs font-normal text-secondary" id="empty-shifts-message-mobile">
              No shift configurations created yet. Tap "Add Shift" to get started.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {shifts.map((shift) => (
                <div key={shift.id} className="p-4 space-y-2" id={`shift-card-${shift.id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-accent-sage" />
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate">{shift.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditClick(shift)}
                        className="p-2 rounded-lg border border-border hover:bg-background text-secondary hover:text-foreground transition-all"
                        id={`btn-edit-shift-mobile-${shift.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(shift.id, shift.name)}
                        className="p-2 rounded-lg border border-border hover:bg-red-50 text-secondary hover:text-red-600 transition-all"
                        id={`btn-delete-shift-mobile-${shift.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary pl-10">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {shift.startTime} – {shift.endTime}
                    </span>
                    <span>Grace: {shift.gracePeriod} mins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table — visible md and above */}
        <div className="hidden md:block bg-card border border-border rounded-xl shadow-soft overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-left" id="shifts-table">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Shift Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Schedule Time (24h)</th>
                <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Grace Period</th>
                <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-xs font-normal text-secondary" id="empty-shifts-message">
                    No shift configurations created yet. Click "Add Shift" to get started.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr
                    key={shift.id}
                    className="hover:bg-background/40 transition-colors duration-150"
                    id={`shift-row-${shift.id}`}
                  >
                    {/* Shift Name & Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-accent-sage" />
                        </div>
                        <span className="text-xs font-semibold text-foreground" id={`shift-name-${shift.id}`}>
                          {shift.name}
                        </span>
                      </div>
                    </td>
                    {/* Timing */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-normal">
                        <Clock className="w-3.5 h-3.5 text-secondary" />
                        <span id={`shift-time-${shift.id}`}>{shift.startTime} – {shift.endTime}</span>
                      </div>
                    </td>
                    {/* Grace Period */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-secondary font-normal">
                      <span id={`shift-grace-${shift.id}`}>{shift.gracePeriod} mins</span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(shift)}
                          className="p-1.5 rounded-lg border border-border hover:bg-background text-secondary hover:text-foreground transition-all duration-200"
                          id={`btn-edit-shift-${shift.id}`}
                          title="Edit shift properties"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(shift.id, shift.name)}
                          className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-secondary hover:text-red-600 transition-all duration-200"
                          id={`btn-delete-shift-${shift.id}`}
                          title="Delete shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Form Overlay Modal */}
      <ShiftForm
        shift={selectedShift}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedShift(null);
        }}
        onRefresh={fetchShifts}
      />
    </div>
  );
}
