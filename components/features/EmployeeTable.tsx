"use client";

import { useState } from "react";
import { Search, Edit2, Calendar, Shield, BadgeAlert, ArrowLeft, ArrowRight, UserPlus, Laptop, MapPin } from "lucide-react";
import EmployeeDrawer from "./EmployeeDrawer";
import { Role } from "@prisma/client";

interface EmployeeTableProps {
  employees: any[];
  shifts: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onParamsChange: (params: { search?: string; isActive?: boolean; page?: number }) => void;
  onRefresh: () => void;
  onAddEmployeeClick: () => void;
}

export default function EmployeeTable({
  employees,
  shifts,
  pagination,
  onParamsChange,
  onRefresh,
  onAddEmployeeClick,
}: EmployeeTableProps) {
  const [searchInput, setSearchInput] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onParamsChange({ search: searchInput, page: 1 });
  };

  const handleFilterChange = (val: string) => {
    setIsActiveFilter(val);
    const isActive = val === "active" ? true : val === "inactive" ? false : undefined;
    onParamsChange({ isActive, page: 1 });
  };

  const handleRowClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col space-y-4" id="employee-table-container">
      {/* Table Actions block (search & filter) */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card border border-border p-4 rounded-xl shadow-soft">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Search employees, department..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-background border border-border pl-10 pr-4 py-2 rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-sage transition-all"
            id="employee-search-bar"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={isActiveFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="bg-background border border-border px-3 py-2 rounded-xl text-xs text-secondary focus:outline-none focus:border-accent-sage appearance-none cursor-pointer"
            id="employee-status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            onClick={onAddEmployeeClick}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-opacity-95 rounded-xl text-xs font-medium shadow-soft transition-all flex items-center gap-1.5"
            id="btn-add-employee-trigger"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Main Table view — desktop lg+ */}
      <div className="hidden lg:block bg-card border border-border rounded-xl shadow-soft overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left" id="employees-table">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Work Mode</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Assigned Shift</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-xs font-normal text-secondary" id="empty-table-message">
                  No employee profiles found matching your search.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const shift = emp.employeeProfile?.shift;
                const initials = emp.name ? emp.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U";

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-background/40 transition-colors duration-150 cursor-pointer"
                    onClick={() => handleRowClick(emp)}
                    id={`employee-row-${emp.id}`}
                  >
                    {/* Employee Profile Identity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-sage/20 border border-accent-sage/35 flex items-center justify-center text-xs font-mono font-medium text-foreground">
                          {initials}
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-foreground" id={`emp-name-${emp.id}`}>{emp.name}</span>
                          <span className="block text-[11px] text-secondary font-normal" id={`emp-email-${emp.id}`}>{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-foreground font-normal">
                      {emp.employeeProfile?.department || <span className="text-secondary">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-foreground">
                      <div className="inline-flex items-center gap-1">
                        {emp.role === Role.ADMIN ? (
                          <span className="inline-flex items-center gap-1 text-foreground bg-accent-sage/10 border border-accent-sage/20 px-2 py-0.5 rounded-full text-[10px] font-medium">
                            <Shield className="w-3 h-3 text-foreground" />
                            Admin
                          </span>
                        ) : (
                          <span className="text-secondary text-[11px]">Employee</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {emp.employeeProfile?.isRemote ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-medium" id={`emp-remote-badge-${emp.id}`}>
                          <Laptop className="w-3 h-3" />
                          Remote
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-secondary bg-background border border-border px-2.5 py-0.5 rounded-full text-[10px] font-normal" id={`emp-onsite-badge-${emp.id}`}>
                          <MapPin className="w-3 h-3" />
                          Onsite
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-foreground">
                      {shift ? (
                        <span className="inline-flex items-center gap-1 text-foreground bg-background border border-border px-2.5 py-0.5 rounded-lg text-[10px] font-normal shadow-soft">
                          <Calendar className="w-3 h-3 text-secondary" />
                          {shift.name} ({shift.startTime})
                        </span>
                      ) : (
                        <span className="text-secondary text-[10px] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {emp.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-foreground bg-accent-sage/10 border border-accent-sage/20 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-sage" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-secondary bg-background border border-border px-2.5 py-0.5 rounded-full text-[10px] font-normal shadow-soft">
                          <BadgeAlert className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-secondary font-normal">
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(emp);
                        }}
                        className="p-1.5 rounded-lg border border-border hover:bg-background text-secondary hover:text-foreground transition-all duration-200"
                        id={`btn-edit-emp-${emp.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet card list — visible below lg */}
      <div className="lg:hidden bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        {employees.length === 0 ? (
          <p className="px-4 py-12 text-center text-xs font-normal text-secondary" id="empty-table-message-mobile">
            No employee profiles found matching your search.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {employees.map((emp) => {
              const shift = emp.employeeProfile?.shift;
              const initials = emp.name ? emp.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U";
              return (
                <div
                  key={emp.id}
                  className="p-4 flex items-center gap-3 hover:bg-background/40 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(emp)}
                >
                  <div className="w-9 h-9 rounded-full bg-accent-sage/20 border border-accent-sage/35 flex items-center justify-center text-xs font-mono font-medium text-foreground shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">{emp.name}</span>
                      {emp.isActive ? (
                        <span className="inline-flex items-center gap-1 text-foreground bg-accent-sage/10 border border-accent-sage/20 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-sage" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-secondary bg-background border border-border px-2 py-0.5 rounded-full text-[10px] shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] text-secondary truncate">{emp.email}</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {emp.employeeProfile?.department && (
                        <span className="text-[10px] text-secondary">{emp.employeeProfile.department}</span>
                      )}
                      {shift && (
                        <span className="text-[10px] text-secondary">{shift.name}</span>
                      )}
                      {emp.employeeProfile?.isRemote ? (
                        <span className="text-[10px] text-blue-500">Remote</span>
                      ) : (
                        <span className="text-[10px] text-secondary">Onsite</span>
                      )}
                    </div>
                  </div>
                  <Edit2 className="w-4 h-4 text-secondary shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-2 py-4" id="table-pagination">
          <span className="text-xs text-secondary text-center sm:text-left">
            Page {pagination.page} of {pagination.totalPages} <span className="hidden sm:inline">({pagination.total} employees total)</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onParamsChange({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              className="p-2 border border-border rounded-xl text-secondary hover:text-foreground bg-card hover:bg-background transition-colors disabled:opacity-50 disabled:pointer-events-none"
              id="btn-pagination-prev"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onParamsChange({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 border border-border rounded-xl text-secondary hover:text-foreground bg-card hover:bg-background transition-colors disabled:opacity-50 disabled:pointer-events-none"
              id="btn-pagination-next"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drawer component instantiation */}
      <EmployeeDrawer
        employee={selectedEmployee}
        shifts={shifts}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEmployee(null);
        }}
        onRefresh={onRefresh}
      />
    </div>
  );
}
