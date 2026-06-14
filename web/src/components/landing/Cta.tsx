import Link from 'next/link';

export default function Cta() {
  return (
    <section id="cta" className="relative overflow-hidden py-32">
      {/* Section background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface) 50%, var(--surface-raised) 100%)',
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--primary), transparent)',
        }}
        aria-hidden
      />

      {/* Centre radial orb */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl pointer-events-none animate-glow-pulse"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 65%)' }}
        aria-hidden
      />

      {/* Stellar network spoke SVG */}
      <svg
        id="cta-svg"
        className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <g stroke="var(--primary)" strokeWidth="1" fill="none">
          <line x1="400" y1="200" x2="100" y2="80"  />
          <line x1="400" y1="200" x2="700" y2="80"  />
          <line x1="400" y1="200" x2="100" y2="320" />
          <line x1="400" y1="200" x2="700" y2="320" />
          <line x1="400" y1="200" x2="0"   y2="200" />
          <line x1="400" y1="200" x2="800" y2="200" />
          <circle cx="400" cy="200" r="80"  strokeDasharray="6 4" />
          <circle cx="400" cy="200" r="150" strokeDasharray="4 6" opacity="0.5" />
          {([
            [100, 80], [700, 80], [100, 320], [700, 320], [0, 200], [800, 200],
          ] as [number, number][]).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill="var(--primary)" />
          ))}
          <circle cx="400" cy="200" r="8" fill="var(--primary)" />
        </g>
      </svg>

      <div className="relative mx-auto max-w-3xl px-6 text-center space-y-6 cta-content">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
          Get started
        </div>
        <h2 className="font-space-grotesk text-4xl font-bold text-on-surface sm:text-5xl">
          Run payroll in one signature
        </h2>
        <p className="text-on-surface-muted text-lg max-w-xl mx-auto">
          Add your roster, preflight, sign once — done.
          No custody, no backend, no waiting.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 text-lg font-semibold text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary overflow-hidden"
          >
            <span className="relative z-10">Open Dashboard →</span>
            <span
              className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"
              aria-hidden
            />
          </Link>
          <Link
            href="/claim"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 backdrop-blur px-8 py-4 text-base font-medium text-on-surface hover:bg-surface-raised transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Claim Earnings
          </Link>
        </div>
      </div>
    </section>
  );
}
