const cards = [
  {
    title: 'Speed',
    body: '3–5 second settlement on Stellar. All recipients confirmed in one atomic transaction.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
    colorClass: 'text-warning',
    borderClass: 'border-warning/20 bg-warning/[0.03]',
    glowClass: 'bg-warning/[0.06]',
  },
  {
    title: 'Cost',
    body: 'Sub-cent fees. No intermediaries, no wire charges, no FX spread — just the Stellar base fee.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 7v10M9.5 9.5h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3H15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    colorClass: 'text-success',
    borderClass: 'border-success/20 bg-success/[0.03]',
    glowClass: 'bg-success/[0.06]',
  },
  {
    title: 'Atomicity',
    body: 'All-or-nothing. Every employee in the batch is paid, or the whole transaction rolls back.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    colorClass: 'text-primary',
    borderClass: 'border-primary/20 bg-primary/[0.03]',
    glowClass: 'bg-primary/[0.07]',
  },
  {
    title: 'Async Delivery',
    body: 'Unready employees get claimable balances. Claim later — no run is ever blocked.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    colorClass: 'text-accent',
    borderClass: 'border-accent/20 bg-accent/[0.03]',
    glowClass: 'bg-accent/[0.07]',
  },
];

export default function Proof() {
  return (
    <section id="proof" className="relative overflow-hidden py-28">
      {/* Background radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Section label */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
            Why Stellar
          </span>
        </div>
        <h2 className="font-space-grotesk text-4xl font-bold text-on-surface text-center mb-16">
          Why Stellar payroll
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c.title}
              className={`proof-card group relative rounded-2xl border p-8 space-y-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${c.borderClass}`}
            >
              {/* Hover glow overlay */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${c.glowClass}`}
                aria-hidden
              />
              {/* Icon */}
              <div
                className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl border border-current/20 ${c.colorClass}`}
                style={{ background: 'var(--surface)' }}
              >
                {c.icon}
              </div>
              <h3 className="font-space-grotesk text-xl font-semibold text-on-surface relative">
                {c.title}
              </h3>
              <p className="text-on-surface-muted relative text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
