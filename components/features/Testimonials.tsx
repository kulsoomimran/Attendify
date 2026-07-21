export default function Testimonials() {
  const reviews = [
    {
      quote: "Before Attendify, we were managing employee check-ins across multiple spreadsheets and messaging channels. Now shifts, leave requests, and hours are mapped automatically with perfect role limits. The design feels like Linear—fast and clear.",
      author: "David Vance",
      role: "VP of People, Acme Corp",
      initials: "DV",
      id: "testimonial-1",
    },
    {
      quote: "Absolute game changer. The relational RBAC constraints gave us confidence that employee clock-in and payroll records couldn't be manipulated. The API is clean and integrates seamlessly with our internal finance reporting tools.",
      author: "Elena Rostova",
      role: "Head of Operations, Retool",
      initials: "ER",
      id: "testimonial-2",
    },
    {
      quote: "Our workers love the streamlined dashboard widget, and our accountants love the monthly analytics aggregates. We've saved hours on processing monthly calculations since making the switch to Attendify.",
      author: "Marcus Aurel",
      role: "Chief Financial Officer, Loom",
      initials: "MA",
      id: "testimonial-3",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-background border-t border-border transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-sans font-light text-3xl sm:text-4xl text-foreground tracking-tight" id="testimonials-title">
            Trusted by operators at scale.
          </h2>
          <p className="mt-4 text-base font-normal text-secondary" id="testimonials-subtitle">
            Read how global companies use Attendify to orchestrate schedules and build clean audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="testimonials-list-grid">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-card border border-border p-6 rounded-xl shadow-soft flex flex-col justify-between hover:border-accent-sage/30 transition-all duration-200"
              id={review.id}
            >
              <p className="text-sm font-normal text-foreground leading-relaxed italic" id={`${review.id}-quote`}>
                &ldquo;{review.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 mt-6">
                {/* Clean circle avatar profile initials placeholder */}
                <div className="w-8 h-8 rounded-full bg-accent-sage/20 border border-accent-sage/35 flex items-center justify-center text-xs font-mono font-medium text-foreground select-none">
                  {review.initials}
                </div>
                <div>
                  <span className="block text-xs font-semibold text-foreground" id={`${review.id}-author`}>
                    {review.author}
                  </span>
                  <span className="block text-[11px] font-normal text-secondary" id={`${review.id}-role`}>
                    {review.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
