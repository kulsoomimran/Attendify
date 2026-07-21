"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, Shield, Mail, Briefcase, Trash2 } from "lucide-react";
import { updateEmployeeAction, deleteEmployeeAction } from "@/server/actions/employee-actions";
import { Role } from "@prisma/client";

interface EmployeeDrawerProps {
  employee: any | null;
  shifts: any[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function EmployeeDrawer({
  employee,
  shifts,
  isOpen,
  onClose,
  onRefresh,
}: EmployeeDrawerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<Role>(Role.EMPLOYEE);
  const [isActive, setIsActive] = useState(true);
  const [isRemote, setIsRemote] = useState(false);
  const [shiftId, setShiftId] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (employee) {
      setName(employee.name || "");
      setEmail(employee.email || "");
      setDepartment(employee.employeeProfile?.department || "");
      setRole(employee.role || Role.EMPLOYEE);
      setIsActive(employee.isActive !== undefined ? employee.isActive : true);
      setIsRemote(employee.employeeProfile?.isRemote ?? false);
      setShiftId(employee.employeeProfile?.shiftId || "");
      setErrorMessage("");
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    const data = {
      name,
      email,
      department: department || null,
      role,
      isActive,
      isRemote,
      shiftId: shiftId || null,
    };

    const result = await updateEmployeeAction(employee.id, data);
    setIsSaving(false);

    if (result.success) {
      onRefresh();
      onClose();
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this employee? This action is permanent and will cascade to all records.")) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    const result = await deleteEmployeeAction(employee.id);
    setIsDeleting(false);

    if (result.success) {
      onRefresh();
      onClose();
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="employee-drawer-overlay">
      {/* Background backdrop */}
      <div
        className="absolute inset-0 bg-primary/25 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 w-full flex sm:pl-10">
        {/* Drawer slide-out panel */}
        <div className="w-full max-w-md sm:max-w-md bg-card border-l border-border shadow-elevation flex flex-col transition-all duration-300 ease-in-out ml-auto">
          {/* Header block */}
          <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-background/50">
            <div>
              <h3 className="text-base font-normal text-foreground" id="drawer-title">Employee Details</h3>
              <p className="text-xs font-normal text-secondary mt-0.5">Edit credentials and shift patterns.</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md border border-border text-secondary hover:text-foreground hover:bg-background transition-all"
              id="btn-close-drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
            {errorMessage && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="drawer-error">
                {errorMessage}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                id="input-employee-name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                  id="input-employee-email"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Department</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  placeholder="e.g. Engineering, HR"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                  id="input-employee-dept"
                />
              </div>
            </div>

            {/* System Role */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Privilege Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all appearance-none"
                  id="select-employee-role"
                >
                  <option value={Role.EMPLOYEE}>Employee</option>
                  <option value={Role.ADMIN}>Administrator (Admin)</option>
                </select>
              </div>
            </div>

            {/* Shift Assignment (Subtask 5) */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Assigned Shift</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <select
                  value={shiftId}
                  onChange={(e) => setShiftId(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all appearance-none"
                  id="select-employee-shift"
                >
                  <option value="">No shift assigned (unassigned)</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Status toggles */}
            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-accent-sage"
                  id="checkbox-employee-active"
                />
                <span className="text-sm font-normal text-foreground">Is Active (Access Enabled)</span>
              </label>

              {/* Remote Employee Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-accent-sage"
                  id="checkbox-employee-remote"
                />
                <div>
                  <span className="text-sm font-normal text-foreground">Remote Employee</span>
                  <p className="text-[10px] text-secondary mt-0.5">Skips geolocation check during clock-in/out. Work plan summary required instead.</p>
                </div>
              </label>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="px-4 sm:px-6 py-4 border-t border-border bg-background/50 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            {/* Delete button (only for existing user) */}
            <button
              onClick={handleDelete}
              type="button"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl border border-transparent hover:border-red-200 transition-all flex items-center justify-center gap-1.5 text-xs font-medium w-full sm:w-auto"
              id="btn-delete-employee"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </button>

            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-xl text-xs font-medium text-secondary hover:text-foreground hover:bg-background transition-all text-center"
                id="btn-cancel-drawer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-xl text-xs font-medium shadow-soft transition-all flex items-center justify-center gap-1.5"
                id="btn-save-drawer"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
