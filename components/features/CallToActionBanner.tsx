import Link from "next/link";

export default function CallToActionBanner() {
  const features = [
    "Geofence Attendance",
    "Shift Scheduling",
    "Leave Management",
    "Holiday Calendar",
    "HR Reporting",
  ];

  return (
    <section className="bg-background py-20" id="cta">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl border border-border/80 bg-linear-to-br from-[#1C1C1C] via-[#222222] to-[#111111] px-8 py-14 shadow-elevation md:px-16 md:py-20">

          {/* Background Glow */}
          <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-accent-sage/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">

            {/* Eyebrow */}
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-sage">
              Ready to simplify workforce management?
            </p>

            {/* Heading */}
            <h2
              id="cta-banner-title"
              className="mt-5 font-sans text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              Everything your HR team needs.
              <br />
              <span className="text-primary-foreground/75">
                One powerful platform.
              </span>
            </h2>

            {/* Description */}
            <p
              id="cta-banner-desc"
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/70"
            >
              Manage geofence-verified attendance, employee shifts, leave
              requests, holidays, and reporting from one intuitive dashboard
              built for growing businesses.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                id="cta-banner-btn-register"
                className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-100"
              >
                Start Free →
              </Link>

              <Link
                href="#features"
                id="cta-banner-btn-features"
                className="rounded-xl border border-white/15 px-8 py-4 text-base font-medium text-white transition-all duration-300 hover:border-white/30 hover:bg-white/5"
              >
                Explore Features
              </Link>
            </div>

            {/* Divider */}
            <div className="mx-auto mt-14 h-px w-full max-w-2xl bg-white/10" />

            {/* Features */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-primary-foreground/75">

              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent-sage" />
                  <span>{feature}</span>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}