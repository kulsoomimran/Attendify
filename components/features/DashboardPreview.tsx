import { AlertCircle, ArrowUpRight, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";

export default function DashboardPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-white via-[#f8faf2] to-[#eef4e6] shadow-[0_32px_80px_-28px_rgba(29,29,29,0.24)]" id="dashboard-preview-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,181,160,0.16),transparent_42%)]" />

      <div className="relative">
        <div className="flex items-center gap-2 border-b border-border/80 bg-background/70 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-border" />
            <div className="h-3 w-3 rounded-full bg-border" />
            <div className="h-3 w-3 rounded-full bg-border" />
          </div>
          <div className="mx-auto w-full max-w-sm rounded-md border border-border bg-card px-6 py-0.5 text-center font-mono text-[11px] text-secondary">
            dashboard.attendify.com/overview
          </div>
        </div>

        <div className="grid min-h-120 grid-cols-1 md:grid-cols-[220px_1fr]">
          <div className="hidden flex-col space-y-6 border-r border-border/80 bg-background/40 p-4 md:flex">
            <div className="flex items-center gap-2 px-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-sage">
                <Clock className="h-3 w-3 text-foreground" />
              </div>
              <span className="font-sans text-xs font-medium tracking-tight text-foreground">Attendify Corp</span>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-secondary">Navigation</div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-normal text-foreground shadow-soft">
                <Clock className="h-3.5 w-3.5 text-accent-sage" />
                <span>Overview</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-normal text-secondary transition-colors duration-200 hover:bg-card/60 hover:text-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Shift Planner</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-normal text-secondary transition-colors duration-200 hover:bg-card/60 hover:text-foreground">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Leave Tracker</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-normal text-secondary transition-colors duration-200 hover:bg-card/60 hover:text-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Audit Logs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-6 bg-card/70 p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-normal text-foreground">Welcome back, Sarah</h3>
                <p className="mt-0.5 text-xs font-normal text-secondary">Your shift today started at 09:00 AM.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-sage/20 bg-accent-sage/10 px-2.5 py-1 text-[11px] font-medium text-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-sage" />
                Active Shift
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/90 p-4 shadow-soft">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-secondary">Hours tracked</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-normal text-foreground">38.5h</span>
                  <span className="flex items-center text-[10px] font-normal text-accent-sage">
                    <TrendingUp className="mr-0.5 h-3 w-3" /> +2.1h
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/90 p-4 shadow-soft">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-secondary">On-time rate</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-normal text-foreground">98.2%</span>
                  <span className="text-[10px] font-normal text-secondary">Ideal</span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/90 p-4 shadow-soft">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-secondary">Remaining leave</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-normal text-foreground">14 days</span>
                  <span className="text-[10px] font-normal text-secondary">Annual</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-secondary">Weekly attendance</span>
                  <span className="mt-0.5 block text-xs font-normal text-foreground">Average: 7.7 hours/day</span>
                </div>
                <button className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-normal text-secondary transition-colors duration-200 hover:text-foreground">
                  Details <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-4 flex h-32 items-end justify-between gap-2 border-t border-border/70 pt-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => {
                  const heights = [70, 65, 80, 75, 72];
                  return (
                    <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                      <div className="w-full rounded-t-md bg-accent-sage/90" style={{ height: `${heights[index]}%` }} />
                      <span className="text-[10px] text-secondary">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
