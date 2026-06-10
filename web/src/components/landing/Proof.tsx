const cards = [
  {
    title: 'Speed',
    icon: '⚡',
    body: '3–5 second settlement on Stellar. All recipients confirmed in one atomic transaction.',
  },
  {
    title: 'Cost',
    icon: '💸',
    body: 'Sub-cent fees. No intermediaries, no wire charges, no FX spread — just the Stellar base fee.',
  },
  {
    title: 'Atomicity',
    icon: '🔗',
    body: 'All-or-nothing. Every employee in the batch is paid, or the whole transaction rolls back.',
  },
  {
    title: 'Async Delivery',
    icon: '📬',
    body: 'Unready employees get claimable balances. Claim later — no run is ever blocked.',
  },
];

export default function Proof() {
  return (
    <section id="proof" className="mx-auto max-w-5xl px-6 py-28">
      <h2 className="font-space-grotesk text-4xl font-bold text-on-surface text-center mb-16">
        Why Stellar payroll
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map((c) => (
          <div
            key={c.title}
            className="proof-card rounded-2xl border border-border bg-surface p-8 space-y-3"
          >
            <div className="text-3xl" aria-hidden>{c.icon}</div>
            <h3 className="font-space-grotesk text-xl font-semibold text-on-surface">
              {c.title}
            </h3>
            <p className="text-on-surface-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
