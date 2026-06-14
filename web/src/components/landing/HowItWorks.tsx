import FlowIllustration from '@/components/brand/FlowIllustration';

const steps = [
  {
    n: '01',
    title: 'Add your roster',
    body: 'Import CSV or add employees manually. Each gets a name, Stellar address, salary, and asset.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14a6 6 0 0112 0v1H4v-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Preflight & preview',
    body: 'MuxPay checks each account. Direct payment, DEX swap, or async claimable balance — decided automatically.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'One signature',
    body: 'A single multi-op transaction. Sign once in Freighter. All deliveries are atomic — all succeed or none do.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-28">
      {/* Section label */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
          How it works
        </span>
      </div>
      <h2 className="font-space-grotesk text-4xl font-bold text-on-surface text-center mb-16">
        Three steps to global payroll
      </h2>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
        {/* Steps with vertical connector */}
        <div className="relative">
          {/* Connector line */}
          <div
            className="absolute left-[19px] top-10 bottom-14 w-px"
            style={{
              background:
                'linear-gradient(to bottom, var(--primary), var(--accent), transparent)',
            }}
            aria-hidden
          />

          {steps.map((s) => (
            <div key={s.n} className="how-step relative flex gap-5 pb-10 last:pb-0">
              {/* Step circle icon */}
              <div className="relative z-10 shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-surface text-primary shadow-sm">
                {s.icon}
              </div>
              <div className="pt-1.5">
                <span className="font-space-grotesk text-xs font-bold text-primary/40 uppercase tracking-widest tabular-nums">
                  {s.n}
                </span>
                <h3 className="font-space-grotesk text-lg font-semibold text-on-surface mt-0.5">
                  {s.title}
                </h3>
                <p className="mt-1 text-on-surface-muted text-sm leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Flow diagram in a frosted card */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm">
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-15 pointer-events-none"
              style={{ background: 'var(--primary)' }}
              aria-hidden
            />
            <div className="relative rounded-3xl border border-border bg-surface/60 backdrop-blur-sm p-6">
              <FlowIllustration className="w-full text-on-surface-muted" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
