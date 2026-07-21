"use client";

import { useState } from "react";
import { X, Loader2, Mail, Shield, Briefcase, Calendar } from "lucide-react";
import { createEmployeeAction } from "@/server/actions/employee-actions";
import { Role } from "@prisma/client";

interface EmployeeAddModalProps {
  shifts: any[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function EmployeeAddModal({
  shifts,
  isOpen,
  onClose,
  onRefresh,
}: EmployeeAddModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<Role>(Role.EMPLOYEE);
  const [shiftId, setShiftId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const data = {
      name,
      email,
      password: password || undefined,
      department: department || null,
      role,
      shiftId: shiftId || null,
    };

    const result = await createEmployeeAction(data);
    setIsLoading(false);

    if (result.success) {
      // Clear inputs
      setName("");
      setEmail("");
      setPassword("");
      setDepartment("");
      setRole(Role.EMPLOYEE);
      setShiftId("");
      onRefresh();
      onClose();
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" id="employee-add-modal-overlay">
      <div
        className="absolute inset-0 bg-primary/25 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-elevation relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-background/50">
          <div>
            <h3 className="text-base font-normal text-foreground" id="add-modal-title">Add New Employee</h3>
            <p className="text-xs font-normal text-secondary mt-0.5">Provision a new user account and workforce profile.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md border border-border text-secondary hover:text-foreground hover:bg-background transition-all"
            id="btn-close-add-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="add-modal-error">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
              id="input-add-name"
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
                placeholder="john.doe@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                id="input-add-email"
              />
            </div>
          </div>

          {/* Password (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Temporary Password <span className="text-secondary lowercase font-normal">(optional)</span>
            </label>
            <input
              type="password"
              placeholder="Leave blank to use 'TempPass123!'"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
              id="input-add-password"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Department</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all"
                  id="input-add-dept"
                />
              </div>
            </div>

            {/* Privilege Role */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Privilege Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all appearance-none"
                  id="select-add-role"
                >
                  <option value={Role.EMPLOYEE}>Employee</option>
                  <option value={Role.ADMIN}>Administrator (Admin)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Assign Shift</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all appearance-none"
                id="select-add-shift"
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

          {/* Action buttons */}
          <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-xl text-xs font-medium text-secondary hover:text-foreground hover:bg-background transition-all"
              id="btn-add-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-xl text-xs font-medium shadow-soft transition-all flex items-center gap-1.5"
              id="btn-add-submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
