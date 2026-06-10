'use client';
import { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import type { PayrollRun, PayrollItem } from '@/lib/types';
import { horizon } from '@/lib/stellar';
import { updateRun } from '@/lib/storage';

interface Props {
  runs: PayrollRun[];
  employerAddress: string;
}

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'text-success',
  failed: 'text-danger',
  submitting: 'text-warning',
  signing: 'text-warning',
  draft: 'text-on-surface-muted',
  blocked: 'text-danger',
  rejected: 'text-danger',
  preflighting: 'text-on-surface-muted',
  ready: 'text-on-surface-muted',
};

const METHOD_BADGE: Record<string, string> = {
  'payment': 'bg-success/10 text-success',
  'path-payment': 'bg-primary/10 text-primary',
  'claimable-balance': 'bg-accent/10 text-accent',
};

export default function RunHistory({ runs, employerAddress }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const refreshClaimed = useCallback(
    async (run: PayrollRun) => {
      setRefreshing(run.id);
      try {
        const updated: PayrollItem[] = await Promise.all(
          run.items.map(async (item) => {
            if (item.method !== 'claimable-balance' || !item.claimableBalanceId) {
              return item;
            }
            try {
              await horizon.claimableBalances().claimableBalance(item.claimableBalanceId).call();
              return { ...item, claimed: false };
            } catch {
              return { ...item, claimed: true };
            }
          }),
        );
        const updatedRun = { ...run, items: updated };
        updateRun(employerAddress, updatedRun);
      } finally {
        setRefreshing(null);
      }
    },
    [employerAddress],
  );

  return (
    <div className="space-y-2">
      {runs.map((run) => (
        <div key={run.id} className="rounded-xl border border-border bg-surface overflow-hidden">
          {/* Run header row */}
          <button
            onClick={() => setExpanded(expanded === run.id ? null : run.id)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-raised transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-expanded={expanded === run.id}
          >
            <span className="text-on-surface-muted">
              {expanded === run.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <span className="text-sm text-on-surface-muted min-w-[160px]">
              {new Date(run.createdAt).toLocaleString()}
            </span>
            <span className={`text-sm font-medium capitalize ${STATUS_STYLE[run.status] ?? 'text-on-surface-muted'}`}>
              {run.status}
            </span>
            <span className="ml-auto text-xs text-on-surface-muted tabular-nums">
              {run.items.length} employee{run.items.length !== 1 ? 's' : ''}
            </span>
          </button>

          {/* Expanded detail */}
          {expanded === run.id && (
            <div className="border-t border-border px-4 py-4 space-y-4">
              {run.txHash && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-on-surface-muted">Tx hash:</span>
                  <span className="font-mono text-xs text-on-surface break-all">{run.txHash}</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${run.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-0.5 shrink-0"
                    aria-label="View on Stellar Expert"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised text-on-surface-muted uppercase tracking-wide">
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-right tabular-nums">Amount</th>
                      <th className="px-3 py-2 text-center">Method</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {run.items.map((item) => (
                      <tr key={item.employeeId} className="bg-surface">
                        <td className="px-3 py-2 text-on-surface">{item.name}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-on-surface">
                          {item.amount} {item.asset}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${METHOD_BADGE[item.method] ?? ''}`}>
                            {item.method}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.method === 'claimable-balance' ? (
                            item.claimed === true ? (
                              <span className="text-success">✓ Claimed</span>
                            ) : item.claimed === false ? (
                              <span className="text-warning">Pending</span>
                            ) : (
                              <span className="text-on-surface-muted">—</span>
                            )
                          ) : (
                            <span className="text-success">Delivered</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {run.items.some((i) => i.method === 'claimable-balance') && (
                <button
                  onClick={() => refreshClaimed(run)}
                  disabled={refreshing === run.id}
                  className="text-xs text-primary hover:underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                >
                  {refreshing === run.id ? 'Refreshing…' : '↻ Refresh claim status'}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
