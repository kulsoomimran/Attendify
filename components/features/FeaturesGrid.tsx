import { BarChart3, CalendarRange, MapPin, ShieldCheck, Users2, Clock3 } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      icon: MapPin,
      title: "Geo-aware attendance",
      description: "Support remote and in-office teams with tamper-resistant clock-ins, geofence-aware logs, and clear lateness insights.",
      chips: ["Clock in / out", "Geofence logs"],
      id: "feature-attendance",
    },
    {
      icon: CalendarRange,
      title: "Shift and leave orchestration",
      description: "Configure shift templates, assign grace windows, and manage holidays and leave requests from one streamlined workspace.",
      chips: ["Shift templates", "Leave approvals"],
      id: "feature-shifts",
    },
    {
      icon: Users2,
      title: "Role-based admin control",
      description: "Keep managers and employees on the right side of the workflow with clear permissions and structured employee management.",
      chips: ["Admin roles", "Employee profiles"],
      id: "feature-rbac",
    },
    {
      icon: ShieldCheck,
      title: "Security that stays audit-ready",
      description: "Every action is traceable through Better Auth-backed session handling and immutable operational logs.",
      chips: ["Session security", "Audit trails"],
      id: "feature-security",
    },
    {
      icon: Clock3,
      title: "Operational visibility in real time",
      description: "Monitor hours worked, present days, late arrivals, and attendance anomalies without chasing spreadsheets.",
      chips: ["Live status", "Daily insights"],
      id: "feature-visibility",
    },
    {
      icon: BarChart3,
      title: "Leadership-ready analytics",
      description: "Turn attendance history into monthly summaries, coverage trends, and cleaner payroll prep for finance teams.",
      chips: ["Monthly summaries", "Payroll readiness"],
      id: "feature-analytics",
    },
  ];

  return (
    <section id="features" className="border-t border-border bg-background py-20 transition-all duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-secondary shadow-soft">
            Operational clarity
          </div>
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" id="features-title">
            Designed to feel calm, fast, and deeply reliable.
          </h2>
          <p className="mt-4 text-base font-normal text-secondary" id="features-subtitle">
            Every module is designed around the real rhythm of modern workforce operations;
            <br/>
            from first clock-in to monthly reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" id="features-list-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-accent-sage/30 hover:shadow-elevation"
                id={feature.id}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-accent-sage via-foreground/20 to-transparent" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-sage/20 bg-accent-sage/10">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                </div>
                <h3 className="mt-5 text-base font-normal text-foreground" id={`${feature.id}-title`}>
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm font-normal leading-relaxed text-secondary" id={`${feature.id}-desc`}>
                  {feature.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {feature.chips.map((chip) => (
                    <span key={chip} className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-secondary">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
