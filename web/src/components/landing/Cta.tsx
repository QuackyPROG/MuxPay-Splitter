import Link from 'next/link';

export default function Cta() {
  return (
    <section
      id="cta"
      className="mx-auto max-w-3xl px-6 py-28 text-center space-y-6"
    >
      <h2 className="font-space-grotesk text-4xl font-bold text-on-surface">
        Run payroll in one signature
      </h2>
      <p className="text-on-surface-muted text-lg">
        Add your roster, preflight, sign once — done.
        No custody, no backend, no waiting.
      </p>
      <Link
        href="/dashboard"
        className="inline-block rounded-xl bg-primary px-10 py-4 text-lg font-semibold text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Open Dashboard →
      </Link>
    </section>
  );
}
