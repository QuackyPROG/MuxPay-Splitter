'use client';
import type { PendingClaim } from '@/lib/types';

type ClaimStatus = 'idle' | 'claiming' | 'claimed' | 'claim-failed';

interface Props {
  claims: PendingClaim[];
  onClaim: (claim: PendingClaim) => void;
  claimStatuses: Record<string, ClaimStatus>;
}

export default function ClaimList({ claims, onClaim, claimStatuses }: Props) {
  return (
    <div className="space-y-3">
      {claims.map((claim) => {
        const status = claimStatuses[claim.balanceId] ?? 'idle';
        return (
          <div
            key={claim.balanceId}
            className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="tabular-nums text-lg font-semibold text-on-surface">
                {claim.amount} {claim.assetCode}
              </p>
              <p className="text-xs text-on-surface-muted mt-0.5">
                From:{' '}
                <span className="font-mono">
                  {claim.sponsor.slice(0, 8)}…{claim.sponsor.slice(-6)}
                </span>
              </p>
            </div>

            <div className="shrink-0">
              {status === 'claimed' ? (
                <span className="text-sm font-medium text-success">✓ Claimed</span>
              ) : status === 'claim-failed' ? (
                <div className="flex flex-col items-end gap-1">
                  <p className="text-xs text-danger" role="alert">Failed</p>
                  <button
                    onClick={() => onClaim(claim)}
                    className="text-xs text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onClaim(claim)}
                  disabled={status === 'claiming'}
                  aria-label={`Claim ${claim.amount} ${claim.assetCode}`}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {status === 'claiming' ? 'Claiming…' : 'Claim'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
