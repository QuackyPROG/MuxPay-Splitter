import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import HeroBackground from './HeroBackground';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100vh] flex-col items-center justify-center px-6 text-center overflow-hidden"
    >
      <HeroBackground />

      <div className="relative z-10 flex flex-col items-center">
        {/* Glowing logo mark */}
        <div id="hero-logo" className="mb-6 relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-glow-pulse"
            style={{ background: 'var(--primary)', transform: 'scale(2.8)' }}
            aria-hidden
          />
          <Logo size={52} className="relative text-primary" />
        </div>

        {/* Live testnet badge */}
        <div
          id="hero-badge"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Live on Stellar Testnet
        </div>

        <h1 className="font-space-grotesk text-5xl font-bold leading-[1.1] text-on-surface sm:text-7xl max-w-4xl">
          Payroll in{' '}
          <span className="relative inline-block">
            <span className="text-primary">one signature</span>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 10"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M2 7 C80 2, 220 2, 298 7"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-lg text-on-surface-muted sm:text-xl leading-relaxed">
          Run noncustodial team payroll on Stellar. Mixed XLM, USDC, and
          async claimable-balance delivery — atomically, in one Freighter sign.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="group relative rounded-xl bg-primary px-8 py-4 text-base font-semibold text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary overflow-hidden"
          >
            <span className="relative z-10">Run Payroll →</span>
            <span
              className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"
              aria-hidden
            />
          </Link>
          <Link
            href="/claim"
            className="rounded-xl border border-border bg-surface/60 backdrop-blur px-8 py-4 text-base font-medium text-on-surface hover:bg-surface-raised transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Claim Pay
          </Link>
        </div>

        {/* Quick stats row */}
        <div id="hero-stats" className="mt-16 flex flex-wrap justify-center gap-10">
          {[
            { value: '5s',     label: 'Settlement' },
            { value: '<$0.01', label: 'Per transaction' },
            { value: '1 sig',  label: 'Any team size' },
          ].map((s) => (
            <div key={s.label} className="hero-stat-item space-y-1 text-center">
              <p className="font-space-grotesk text-2xl font-bold text-primary tabular-nums">
                {s.value}
              </p>
              <p className="text-xs text-on-surface-muted uppercase tracking-widest">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden
      >
        <span className="text-xs uppercase tracking-widest text-on-surface-muted opacity-40">
          Scroll
        </span>
        <div className="relative h-9 w-5 rounded-full border border-on-surface-muted/20">
          <div className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-on-surface-muted/40 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
