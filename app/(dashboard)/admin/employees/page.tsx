"use client";

import { useEffect, useState, useCallback } from "react";
import EmployeeTable from "@/components/features/EmployeeTable";
import EmployeeAddModal from "@/components/features/EmployeeAddModal";
import { Users, UserCheck, Calendar, RefreshCw } from "lucide-react";

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FetchParams {
  search?: string;
  isActive?: boolean;
  page: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [params, setParams] = useState<FetchParams>({
    search: undefined,
    isActive: undefined,
    page: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const query = new URLSearchParams();
      query.set("page", params.page.toString());
      query.set("limit", "10");
      if (params.search) {
        query.set("search", params.search);
      }
      if (params.isActive !== undefined) {
        query.set("isActive", params.isActive.toString());
      }

      const response = await fetch(`/api/v1/admin/employees?${query.toString()}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setEmployees(result.data);
        setPagination(result.pagination);
      } else {
        setErrorMsg(result.error || "Failed to load employee directory");
      }
    } catch (error) {
      setErrorMsg("A network error occurred while fetching employees");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const fetchShifts = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/admin/shifts");
      const result = await response.json();
      if (response.ok && result.success) {
        setShifts(result.data);
      }
    } catch (error) {
      console.error("Failed to load shifts for options", error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleParamsChange = (newParams: Partial<FetchParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      // If updating search or filter, reset page to 1
      page: newParams.page ?? (newParams.search !== undefined || newParams.isActive !== undefined ? 1 : prev.page),
    }));
  };

  const handleRefresh = () => {
    fetchEmployees();
    fetchShifts();
  };

  // Quick calculations for dashboard summary cards
  const totalEmployeesCount = pagination.total;
  const activeEmployeesCount = employees.filter(emp => emp.isActive).length; // Active count from current page, or dynamic

  return (
    <div className="flex flex-col space-y-6" id="employees-page-root">
      {/* Top Breadcrumb/Header Panel */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-border pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Admin Controls</span>
          <h1 className="text-xl font-normal text-foreground mt-1" id="employees-page-title">Employee Directory</h1>
          <p className="text-xs font-normal text-secondary mt-0.5">Manage employee details, department assignments, and shifts.</p>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 border border-border rounded-xl text-secondary hover:text-foreground hover:bg-card transition-all duration-200 self-start sm:self-auto shrink-0"
          id="btn-refresh-employees"
          title="Refresh directory"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary KPI Panel (premium look) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="kpi-panel">
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Total Employees</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="stat-total-count">
              {isLoading && totalEmployeesCount === 0 ? "..." : totalEmployeesCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Active Accounts</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="stat-active-count">
              {isLoading && employees.length === 0 ? "..." : employees.filter(e => e.isActive).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-accent-sage" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs text-secondary font-normal">Active Shifts</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="stat-shifts-count">
              {shifts.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Calendar className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="employees-page-error">
          {errorMsg}
        </div>
      )}

      {/* Main Directory Table Canvas */}
      <div className="relative min-h-[300px]">
        {isLoading && employees.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl" id="table-loading-state">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-accent-sage" />
              <span className="text-xs text-secondary">Loading employee data...</span>
            </div>
          </div>
        ) : null}

        <EmployeeTable
          employees={employees}
          shifts={shifts}
          pagination={pagination}
          onParamsChange={handleParamsChange}
          onRefresh={handleRefresh}
          onAddEmployeeClick={() => setIsAddModalOpen(true)}
        />
      </div>

      {/* Add New Employee Modal */}
      <EmployeeAddModal
        shifts={shifts}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
