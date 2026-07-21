// import Link from "next/link";
import { CalendarRange, Clock3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import DashboardPreview from "./DashboardPreview";

export default function HeroSection() {
  const highlights = [
    { icon: MapPin, label: "Geo-aware attendance" },
    { icon: Clock3, label: "Shift & leave workflows" },
    { icon: ShieldCheck, label: "Audit-ready security" },
    { icon: CalendarRange, label: "Holiday & office controls" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-background px-4 pb-20 pt-20 sm:px-6 md:pb-24 md:pt-28 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-128 bg-[radial-gradient(circle_at_top,rgba(168,181,160,0.18),transparent_68%)]" />
      <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-sage/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-sage/20 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-accent-sage" />
          Attendify 1.0 is now live
        </div>

        <h1 className="mt-8 max-w-4xl font-sans text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl" id="hero-title">
          Your workforce, perfectly organized.
        </h1>

        <p className="mt-6 max-w-2.5xl text-base font-normal leading-relaxed text-secondary sm:text-lg md:text-xl" id="hero-description">
          Geofence-verified attendance, smarter shift planning, leave approvals, and real-time insights—all in one platform.
        </p>

        {/* <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-center font-medium text-primary-foreground shadow-soft transition-all duration-200 hover:-translate-y-px hover:bg-opacity-95 sm:w-auto"
            id="hero-btn-register"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#features"
            className="w-full rounded-xl border border-border bg-card px-8 py-3.5 text-center font-medium text-foreground shadow-soft transition-all duration-200 hover:bg-background sm:w-auto"
            id="hero-btn-demo"
          >
            Explore the platform
          </Link>
        </div> */}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-sm font-medium text-foreground shadow-soft"
              >
                <Icon className="h-4 w-4 text-accent-sage" />
                {item.label}
              </div>
            );
          })}
        </div>

        <div className="mt-16 w-full max-w-6xl px-2 sm:px-0 md:mt-20" id="hero-preview-container">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
