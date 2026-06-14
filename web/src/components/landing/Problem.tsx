const stats = [
  { value: '3–5', unit: 'days', label: 'Traditional settlement',     bad: true  },
  { value: '3–8', unit: '%',    label: 'Cross-border remittance fees', bad: true  },
  { value: '1',   unit: 'sig',  label: 'What MuxPay needs',           bad: false },
];

export default function Problem() {
  return (
    <section id="problem" className="relative overflow-hidden py-28">
      {/* Section background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, var(--surface-raised) 0%, var(--background) 50%, var(--surface-raised) 100%)',
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Section label */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-danger/20 bg-danger/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-danger">
            <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden>
              <circle cx="4" cy="4" r="4" fill="currentColor" />
            </svg>
            The Problem
          </span>
        </div>

        <h2 className="font-space-grotesk text-4xl font-bold text-on-surface text-center mb-4">
          Payroll is broken for distributed teams
        </h2>
        <p className="text-center text-on-surface-muted text-lg mb-16 max-w-2xl mx-auto">
          International wires, multi-day rails, and currency conversion fees eat
          into every payroll run. Stellar fixes this.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`problem-stat group relative rounded-2xl border p-8 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                s.bad
                  ? 'border-danger/20 bg-danger/[0.03]'
                  : 'border-primary/30 bg-primary/[0.04]'
              }`}
            >
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  s.bad ? 'bg-danger/[0.04]' : 'bg-primary/[0.06]'
                }`}
                aria-hidden
              />
              <p
                className={`relative font-space-grotesk text-5xl font-bold tabular-nums ${
                  s.bad ? 'text-danger' : 'text-primary'
                }`}
              >
                {s.value}
                <span className="text-2xl ml-1 font-medium opacity-70">{s.unit}</span>
              </p>
              <p className="relative mt-3 text-on-surface-muted text-sm">{s.label}</p>
              <div className="relative mt-4 flex justify-center">
                {s.bad ? (
                  <span className="inline-flex items-center gap-1 text-xs text-danger/60 font-medium">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
                      <path d="M5 3v2.5M5 7.5v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    Old way
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-primary/70 font-medium">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    MuxPay
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
