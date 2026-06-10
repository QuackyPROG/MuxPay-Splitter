import Link from 'next/link';
import Logo from '@/components/brand/Logo';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center"
    >
      <div className="mb-6 flex items-center gap-3 text-on-surface-muted text-sm uppercase tracking-widest">
        <Logo size={20} />
        <span>MuxPay</span>
      </div>

      <h1 className="font-space-grotesk text-5xl font-bold leading-tight text-on-surface sm:text-7xl">
        Payroll in{' '}
        <span className="text-primary">one signature</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-on-surface-muted sm:text-xl">
        Run noncustodial team payroll on Stellar. Mixed XLM, USDC, and
        async claimable-balance delivery — all atomically, all in one Freighter
        sign.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-xl bg-primary px-8 py-4 text-base font-semibold text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Run Payroll →
        </Link>
        <Link
          href="/claim"
          className="rounded-xl border border-border bg-surface px-8 py-4 text-base font-medium text-on-surface hover:bg-surface-raised transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Claim Pay
        </Link>
      </div>

      <div className="absolute bottom-8 animate-bounce text-on-surface-muted" aria-hidden>
        ↓
      </div>
    </section>
  );
}
