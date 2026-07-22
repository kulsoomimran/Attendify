"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Inbox } from "lucide-react";
import AdminReviewCard from "@/components/features/AdminReviewCard";
import { LeaveStatus } from "@prisma/client";

export default function AdminLeaveRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/v1/admin/leave-requests");
      const result = await response.json();
      if (response.ok && result.success) {
        setRequests(result.data);
      } else {
        setErrorMsg(result.error || "Failed to load leave requests.");
      }
    } catch (err) {
      setErrorMsg(`A network error occurred while updating the requests. ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const pendingRequests = requests.filter(req => req.status === LeaveStatus.PENDING);
  const reviewedRequests = requests.filter(req => req.status !== LeaveStatus.PENDING);

  const displayedRequests = activeTab === "PENDING" ? pendingRequests : reviewedRequests;

  return (
    <div className="flex flex-col space-y-6" id="admin-leave-requests-root">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-border pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Operations Portal</span>
          <h1 className="text-xl font-normal text-foreground mt-1" id="admin-leave-requests-title">
            Leave Approvals Feed
          </h1>
          <p className="text-xs font-normal text-secondary mt-0.5">
            Review, approve, or reject employee time-off requests.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2 border border-border rounded-xl text-secondary hover:text-foreground hover:bg-card transition-all duration-200 self-start sm:self-auto shrink-0"
          id="btn-refresh-admin-leaves"
          title="Refresh requests"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="admin-leaves-error">
          {errorMsg}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-border/60 gap-6">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 text-xs font-medium border-b-2 transition-all relative ${
            activeTab === "PENDING"
              ? "border-primary text-foreground"
              : "border-transparent text-secondary hover:text-foreground"
          }`}
          id="tab-pending-leaves"
        >
          Pending Reviews
          {pendingRequests.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-accent-sage text-primary text-[9px] font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === "HISTORY"
              ? "border-primary text-foreground"
              : "border-transparent text-secondary hover:text-foreground"
          }`}
          id="tab-history-leaves"
        >
          Review History
        </button>
      </div>

      {/* Content Feed Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-secondary flex items-center justify-center gap-2" id="admin-leaves-loading">
          <span className="w-4 h-4 border-2 border-accent-sage border-t-transparent rounded-full animate-spin" />
          Loading request feed...
        </div>
      ) : displayedRequests.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-xs text-secondary flex flex-col items-center justify-center space-y-3 shadow-soft" id="admin-leaves-empty">
          <Inbox className="w-8 h-8 text-secondary/60" />
          <p>No leave requests in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin-leave-requests-grid">
          {displayedRequests.map((req) => (
            <AdminReviewCard
              key={req.id}
              request={req}
              onReviewSuccess={fetchRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
}
