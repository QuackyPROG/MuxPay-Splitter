'use client';
import type { TxStatus } from '@/lib/types';

const STEP_LABELS: Record<TxStatus, string> = {
  idle: '',
  building: 'Building transaction…',
  signing: 'Waiting for Freighter signature…',
  submitting: 'Submitting to Horizon…',
  success: '',
  error: '',
};

interface Props {
  status: TxStatus;
  hash: string | null;
  error: string | null;
  recipientCount: number;
}

export default function StatusPanel({
  status,
  hash,
  error,
  recipientCount,
}: Props) {
  if (status === 'success' && hash) {
    return (
      <div className="mt-6 rounded border border-emerald-200 bg-emerald-50 p-6">
        <p className="mb-1 text-lg font-semibold text-emerald-800">
          Batch delivered atomically
        </p>
        <p className="mb-1 text-sm text-emerald-700">
          {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} paid in
          a single transaction — all ops committed or none.
        </p>
        <p className="mb-4 break-all font-mono text-xs text-emerald-700">
          {hash}
        </p>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          View all ops on Stellar Expert →
        </a>
      </div>
    );
  }

  if (status === 'error' && error) {
    return (
      <div className="mt-6 rounded border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-800">Transaction failed</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <p className="mt-2 text-xs text-red-500">
          Check Stellar Expert for details, or edit recipients and try again.
        </p>
      </div>
    );
  }

  if (STEP_LABELS[status]) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded border border-indigo-200 bg-indigo-50 p-4">
        <span className="animate-spin text-indigo-600">⟳</span>
        <p className="text-sm text-indigo-700">{STEP_LABELS[status]}</p>
      </div>
    );
  }

  return null;
}
