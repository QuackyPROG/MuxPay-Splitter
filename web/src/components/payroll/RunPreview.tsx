'use client';
import type { PayrollItem } from '@/lib/types';

interface Cost {
  totalXlm: string;
  feeXlm: string;
  reserveXlm: string;
  usdcTotal: string;
}

interface Props {
  items: PayrollItem[];
  cost: Cost;
}

const METHOD_LABELS = {
  'payment': 'Direct',
  'path-payment': 'Swap',
  'claimable-balance': 'Async CB',
} as const;

const METHOD_STYLE = {
  'payment': 'bg-success/10 text-success border border-success/20',
  'path-payment': 'bg-primary/10 text-primary border border-primary/20',
  'claimable-balance': 'bg-accent/10 text-accent border border-accent/20',
} as const;

export default function RunPreview({ items, cost }: Props) {
  const cbItems = items.filter((i) => i.method === 'claimable-balance');

  return (
    <div className="space-y-4">
      {/* Per-item table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised text-on-surface-muted text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-right tabular-nums">Amount</th>
              <th className="px-4 py-3 text-center">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.employeeId} className="bg-surface hover:bg-surface-raised">
                <td className="px-4 py-3">
                  <p className="font-medium text-on-surface">{item.name}</p>
                  <p className="text-xs font-mono text-on-surface-muted mt-0.5">
                    {item.destination.slice(0, 8)}…{item.destination.slice(-6)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="text-on-surface">
                    {item.amount} {item.asset}
                  </span>
                  {item.sendMaxXlm && (
                    <p className="text-xs text-on-surface-muted">
                      sendMax: {item.sendMaxXlm} XLM
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${METHOD_STYLE[item.method]}`}
                    title={item.method === 'claimable-balance' ? 'Employee claims later' : undefined}
                  >
                    {METHOD_LABELS[item.method]}
                    {item.method === 'claimable-balance' && (
                      <span aria-label="async claim required">⧖</span>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cost summary */}
      <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-2">
        <p className="text-sm font-semibold text-on-surface">Cost Summary</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm tabular-nums">
          <span className="text-on-surface-muted">XLM payments</span>
          <span className="text-right text-on-surface">{cost.totalXlm} XLM</span>
          <span className="text-on-surface-muted">Network fee</span>
          <span className="text-right text-on-surface">{cost.feeXlm} XLM</span>
          {parseFloat(cost.reserveXlm) > 0 && (
            <>
              <span className="text-on-surface-muted">CB reserve (locked)</span>
              <span className="text-right text-accent">{cost.reserveXlm} XLM</span>
            </>
          )}
          {parseFloat(cost.usdcTotal) > 0 && (
            <>
              <span className="text-on-surface-muted">USDC deliveries</span>
              <span className="text-right text-on-surface">{cost.usdcTotal} USDC</span>
            </>
          )}
        </div>
        {parseFloat(cost.reserveXlm) > 0 && (
          <p className="text-xs text-on-surface-muted pt-1 border-t border-border">
            {cbItems.length} claimable balance{cbItems.length !== 1 ? 's' : ''} — {cost.reserveXlm} XLM locked until claimed or reclaimed after 7 days.
          </p>
        )}
      </div>
    </div>
  );
}
