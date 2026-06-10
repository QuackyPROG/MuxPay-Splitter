'use client';
import type { TxStatus } from '@/lib/types';

const STEP_LABELS: Partial<Record<TxStatus, string>> = {
  building: 'Building transaction…',
  signing: 'Waiting for Freighter signature…',
  submitting: 'Submitting to Horizon…',
};

interface Props {
  status: TxStatus;
  hash: string | null;
  error: string | null;
  recipientCount: number;
}

export default function StatusPanel({ status, hash, error, recipientCount }: Props) {
  if (status === 'success' && hash) {
    return (
      <div
        className="mt-4 rounded-xl border border-success/30 bg-success/5 p-6 space-y-3"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-semibold text-success">
          Batch delivered atomically
        </p>
        <p className="text-sm text-on-surface-muted">
          {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} paid in
          one transaction — all ops committed or none.
        </p>
        <p className="break-all font-mono text-xs text-on-surface-muted">{hash}</p>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-success/20 px-5 py-2 text-sm font-medium text-success hover:bg-success/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
        >
          View all ops on Stellar Expert →
        </a>
      </div>
    );
  }

  if (status === 'error' && error) {
    return (
      <div
        className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4 space-y-1"
        role="alert"
      >
        <p className="font-medium text-danger">Transaction failed</p>
        <p className="text-sm text-on-surface-muted">{error}</p>
      </div>
    );
  }

  const label = STEP_LABELS[status];
  if (label) {
    return (
      <div
        className="mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
        role="status"
        aria-live="polite"
      >
        <span className="animate-spin text-primary" aria-hidden>⟳</span>
        <p className="text-sm text-primary">{label}</p>
      </div>
    );
  }

  return null;
}
