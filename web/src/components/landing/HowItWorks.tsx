import FlowIllustration from '@/components/brand/FlowIllustration';

const steps = [
  { n: '01', title: 'Add your roster', body: 'Import CSV or add employees manually. Each gets a name, Stellar address, salary, and asset.' },
  { n: '02', title: 'Preflight & preview', body: 'MuxPay checks each account. Direct payment, DEX swap, or async claimable balance — decided automatically.' },
  { n: '03', title: 'One signature', body: 'A single multi-op transaction. Sign once in Freighter. All deliveries are atomic — all succeed or none do.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-28">
      <h2 className="font-space-grotesk text-4xl font-bold text-on-surface text-center mb-16">
        How it works
      </h2>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
        {/* Steps */}
        <div className="space-y-8">
          {steps.map((s) => (
            <div key={s.n} className="how-step flex gap-4">
              <span className="font-space-grotesk text-3xl font-bold text-primary/30 tabular-nums w-10 shrink-0">
                {s.n}
              </span>
              <div>
                <h3 className="font-space-grotesk text-lg font-semibold text-on-surface">
                  {s.title}
                </h3>
                <p className="mt-1 text-on-surface-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="flex justify-center">
          <FlowIllustration className="w-full max-w-sm text-on-surface-muted" />
        </div>
      </div>
    </section>
  );
}
