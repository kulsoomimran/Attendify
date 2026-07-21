"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Clock, UserCheck, AlertTriangle, XCircle, RefreshCw,
  Search, Filter, ChevronLeft, ChevronRight, Download,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface AttendanceLog {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  workingHours: number | null;
  lateMinutes: number;
  status: "PRESENT" | "LATE" | "ABSENT" | "HALFDAY" | "LEAVE";
  notes: string | null;
  employee: {
    user: { id: string; name: string; email: string };
    shift: { name: string; startTime: string; endTime: string } | null;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TodayStats {
  present: number;
  late: number;
  absent: number;
}

const STATUS_OPTIONS = ["", "PRESENT", "LATE", "ABSENT", "HALFDAY", "LEAVE"] as const;

const STATUS_BADGE: Record<string, string> = {
  PRESENT: "bg-accent-sage/15 text-accent-sage border border-accent-sage/30",
  LATE:    "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  ABSENT:  "bg-red-500/15 text-red-400 border border-red-500/30",
  HALFDAY: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  LEAVE:   "bg-purple-500/15 text-purple-400 border border-purple-500/30",
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function AdminAttendancePage() {
  const [logs, setLogs]             = useState<AttendanceLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [todayStats, setTodayStats] = useState<TodayStats>({ present: 0, late: 0, absent: 0 });
  const [isLoading, setIsLoading]   = useState(true);
  const [errorMsg, setErrorMsg]     = useState("");

  // Filters
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [page,     setPage]     = useState(1);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const q = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (search)   q.set("search",   search);
      if (status)   q.set("status",   status);
      if (dateFrom) q.set("dateFrom", dateFrom);
      if (dateTo)   q.set("dateTo",   dateTo);

      const res  = await fetch(`/api/v1/admin/attendance?${q}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
        setTodayStats(data.todayStats);
      } else {
        setErrorMsg(data.error || "Failed to load attendance data.");
      }
    } catch {
      setErrorMsg("A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [search, status, dateFrom, dateTo, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Reset page when filters change
  const applyFilter = () => { setPage(1); fetchLogs(); };

  // ── CSV Export ────────────────────────────────────────────────────────────
  function exportCSV() {
    const header = ["Date", "Employee", "Email", "Shift", "Status", "Clock In", "Clock Out", "Hours", "Late (min)"];
    const rows = logs.map((l) => [
      fmtDate(l.date),
      l.employee.user.name,
      l.employee.user.email,
      l.employee.shift?.name ?? "—",
      l.status,
      fmtTime(l.clockIn),
      fmtTime(l.clockOut),
      l.workingHours != null ? l.workingHours.toFixed(2) : "—",
      l.lateMinutes,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col space-y-6" id="admin-attendance-root">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-border pb-5">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Admin Controls</span>
          <h1 className="text-xl font-normal text-foreground mt-1" id="attendance-page-title">Attendance Ledger</h1>
          <p className="text-xs font-normal text-secondary mt-0.5">
            Browse, filter, and export the full attendance history for all employees.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCSV}
            disabled={logs.length === 0}
            id="btn-export-csv"
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs text-secondary hover:text-foreground hover:bg-card disabled:opacity-40 transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => fetchLogs()}
            id="btn-refresh-attendance"
            title="Refresh"
            className="p-2 border border-border rounded-xl text-secondary hover:text-foreground hover:bg-card transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="attendance-kpis">
        {/* Present Today */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Present Today</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="kpi-present-today">
              {isLoading ? "..." : todayStats.present}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-sage/10 border border-accent-sage/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-accent-sage" />
          </div>
        </div>

        {/* Late Today */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Late Today</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="kpi-late-today">
              {isLoading ? "..." : todayStats.late}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Total Records */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary font-normal">Total Records</span>
            <span className="block text-2xl font-normal text-foreground mt-1" id="kpi-total-records">
              {isLoading ? "..." : pagination.total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Clock className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-soft" id="attendance-filters">
        <div className="flex flex-col gap-3">
          {/* Search — full width */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Search employee</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
              <input
                id="filter-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilter()}
                placeholder="Name or email…"
                className="w-full pl-8 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-sage/40 transition-all duration-200"
              />
            </div>
          </div>

          {/* Row: Status + Date range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Status</label>
              <select
                id="filter-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-sage/40 transition-all duration-200 cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s || "All Statuses"}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary">From</label>
              <input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-sage/40 transition-all duration-200"
              />
            </div>

            {/* Date To */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary">To</label>
              <input
                id="filter-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full py-2.5 px-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-sage/40 transition-all duration-200"
              />
            </div>
          </div>

          {/* Apply / Clear */}
          <div className="flex gap-2">
            <button
              onClick={applyFilter}
              id="btn-apply-filter"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:opacity-90 transition-all duration-200 shadow-soft"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filters
            </button>
            <button
              onClick={() => { setSearch(""); setStatus(""); setDateFrom(""); setDateTo(""); setPage(1); }}
              id="btn-clear-filter"
              className="flex-1 sm:flex-none px-3 py-2.5 border border-border rounded-xl text-sm text-secondary hover:text-foreground hover:bg-background transition-all duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl">
          <XCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* ── Mobile Card List (below sm) ── */}
      <div className="sm:hidden bg-card border border-border rounded-xl shadow-soft overflow-hidden" id="attendance-cards-mobile">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse h-20 bg-border/30 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-secondary text-xs flex flex-col items-center gap-3">
            <Clock className="w-8 h-8 text-border" />
            No attendance records match your current filters.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-accent-sage/15 border border-accent-sage/25 flex items-center justify-center text-[10px] font-mono font-semibold text-foreground shrink-0">
                      {initials(log.employee.user.name)}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-foreground truncate">{log.employee.user.name}</span>
                      <span className="block text-[10px] text-secondary truncate">{log.employee.user.email}</span>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ${STATUS_BADGE[log.status] ?? ""}`}>
                    {log.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-secondary pl-10">
                  <span><span className="font-semibold text-foreground">Date:</span> {fmtDate(log.date)}</span>
                  <span><span className="font-semibold text-foreground">In:</span> {fmtTime(log.clockIn)}</span>
                  <span><span className="font-semibold text-foreground">Out:</span> {fmtTime(log.clockOut)}</span>
                  <span><span className="font-semibold text-foreground">Hours:</span> {log.workingHours != null ? `${log.workingHours.toFixed(2)}h` : "—"}</span>
                  {log.lateMinutes > 0 && (
                    <span className="col-span-2 text-amber-400 font-semibold">+{log.lateMinutes} min late</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Mobile pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background/30">
            <span className="text-[11px] text-secondary">{pagination.page}/{pagination.totalPages}</span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page <= 1}
                className="p-2 border border-border rounded-lg text-secondary hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={pagination.page >= pagination.totalPages}
                className="p-2 border border-border rounded-lg text-secondary hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop Table (sm and above) ── */}
      <div className="hidden sm:block bg-card border border-border rounded-xl shadow-soft overflow-hidden" id="attendance-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" id="attendance-table">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold text-secondary">Employee</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold text-secondary">Date</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold text-secondary">Shift</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold text-secondary">Clock In</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold text-secondary">Clock Out</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold text-secondary">Hours</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold text-secondary">Late (min)</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider font-semibold text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 bg-border rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-secondary text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-3 text-border" />
                    No attendance records match your current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-background/40 transition-colors duration-150 group">
                    {/* Employee */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent-sage/15 border border-accent-sage/25 flex items-center justify-center text-[10px] font-mono font-semibold text-foreground shrink-0">
                          {initials(log.employee.user.name)}
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-foreground leading-tight">
                            {log.employee.user.name}
                          </span>
                          <span className="block text-[10px] text-secondary leading-tight">
                            {log.employee.user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-3.5 text-xs text-foreground whitespace-nowrap">{fmtDate(log.date)}</td>
                    {/* Shift */}
                    <td className="px-5 py-3.5 text-xs text-secondary whitespace-nowrap">
                      {log.employee.shift
                        ? <span>{log.employee.shift.name} <span className="text-[10px]">({log.employee.shift.startTime}–{log.employee.shift.endTime})</span></span>
                        : <span className="italic text-secondary/50">No shift</span>
                      }
                    </td>
                    {/* Clock In */}
                    <td className="px-5 py-3.5 text-xs font-mono text-foreground whitespace-nowrap">{fmtTime(log.clockIn)}</td>
                    {/* Clock Out */}
                    <td className="px-5 py-3.5 text-xs font-mono text-secondary whitespace-nowrap">{fmtTime(log.clockOut)}</td>
                    {/* Hours */}
                    <td className="px-5 py-3.5 text-xs text-foreground whitespace-nowrap">
                      {log.workingHours != null ? `${log.workingHours.toFixed(2)} h` : "—"}
                    </td>
                    {/* Late */}
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                      {log.lateMinutes > 0
                        ? <span className="text-amber-400 font-semibold">+{log.lateMinutes} min</span>
                        : <span className="text-secondary">—</span>
                      }
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_BADGE[log.status] ?? ""}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-background/30">
            <span className="text-[11px] text-secondary">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                id="btn-prev-page"
                className="p-1.5 border border-border rounded-lg text-secondary hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-foreground px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                id="btn-next-page"
                className="p-1.5 border border-border rounded-lg text-secondary hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
