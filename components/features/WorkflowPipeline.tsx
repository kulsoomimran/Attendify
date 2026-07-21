import {
  CalendarCheck,
  ClipboardList,
  Fingerprint,
  ArrowRight,
} from "lucide-react";

export default function WorkflowPipeline() {
  const steps = [
    {
      icon: ClipboardList,
      badge: "Step 1",
      title: "Set up your workspace",
      description:
        "Create your organization, invite employees, and configure shifts and attendance rules in minutes.",
    },
    {
      icon: Fingerprint,
      badge: "Step 2",
      title: "Track attendance",
      description:
        "Employees clock in with geofence verification while managers monitor attendance in real time.",
    },
    {
      icon: CalendarCheck,
      badge: "Step 3",
      title: "Approve & stay informed",
      description:
        "Handle leave requests, manage holidays, and generate reports from one centralized dashboard.",
    },
  ];

  return (
    <section
      id="workflow"
      className="border-t border-border bg-background py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}

        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full border border-border bg-card px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-secondary">
            How it works
          </span>

          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            From onboarding to monthly reports, everything stays organized in one workflow.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-secondary">
            Attendify brings attendance, scheduling, leave management, and reporting into one workflow your team can actually enjoy using.
          </p>
        </div>

        {/* Steps */}

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="group rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-2 hover:border-accent-sage/40 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-sage/10">
                    <Icon className="h-7 w-7 text-accent-sage" />
                  </div>

                  <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-secondary">
                    {step.badge}
                  </span>
                </div>

                <h3 className="mt-8 text-2xl font-medium text-foreground">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-secondary">
                  {step.description}
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-accent-sage opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}