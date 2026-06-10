export default function Problem() {
  const stats = [
    { value: '3–5 days', label: 'Traditional payroll settlement' },
    { value: '3–8%', label: 'Cross-border remittance fees' },
    { value: '1 sig', label: 'What MuxPay needs' },
  ];

  return (
    <section id="problem" className="mx-auto max-w-5xl px-6 py-28">
      <h2 className="font-space-grotesk text-4xl font-bold text-on-surface text-center mb-4">
        Payroll is broken for distributed teams
      </h2>
      <p className="text-center text-on-surface-muted text-lg mb-16 max-w-2xl mx-auto">
        International wires, multi-day rails, and currency conversion fees eat
        into every payroll run. Stellar fixes this.
      </p>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className="problem-stat rounded-2xl border border-border bg-surface p-8 text-center"
          >
            <p className="font-space-grotesk text-4xl font-bold text-primary tabular-nums">
              {s.value}
            </p>
            <p className="mt-2 text-on-surface-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
