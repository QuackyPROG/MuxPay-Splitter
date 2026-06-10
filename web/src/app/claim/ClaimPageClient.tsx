'use client';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import ConnectWallet from '@/components/ConnectWallet';
import EmptyState from '@/components/brand/EmptyState';
import ClaimList from '@/components/claim/ClaimList';
import StatusPanel from '@/components/muxpay/StatusPanel';
import { useWallet } from '@/hooks/useWallet';
import { fetchPendingClaims, buildClaimXDR } from '@/lib/claims';
import { hasTrustline } from '@/lib/trustline';
import { submitBatchTx } from '@/lib/batch';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import type { PendingClaim, TxStatus } from '@/lib/types';

type ClaimStatus = 'idle' | 'claiming' | 'claimed' | 'claim-failed';
type PageState = 'idle' | 'loading-claims' | 'listed' | 'empty';

const SIGN_TIMEOUT_MS = 5000;

export default function ClaimPageClient() {
  const wallet = useWallet();
  const { publicKey } = wallet;

  const [pageState, setPageState] = useState<PageState>('idle');
  const [claims, setClaims] = useState<PendingClaim[]>([]);
  const [claimStatuses, setClaimStatuses] = useState<Record<string, ClaimStatus>>({});
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const loadClaims = useCallback(async (address: string) => {
    setPageState('loading-claims');
    const result = await fetchPendingClaims(address);
    setClaims(result);
    setPageState(result.length > 0 ? 'listed' : 'empty');
  }, []);

  useEffect(() => {
    if (publicKey) loadClaims(publicKey);
    else setPageState('idle');
  }, [publicKey, loadClaims]);

  const handleClaim = useCallback(
    async (claim: PendingClaim) => {
      if (!publicKey) return;

      setClaimStatuses((p) => ({ ...p, [claim.balanceId]: 'claiming' }));
      setTxStatus('building');
      setTxError(null);
      setTxHash(null);

      try {
        const needsTrustline =
          claim.assetCode === 'USDC' && !(await hasTrustline(publicKey));

        const xdr = await buildClaimXDR(publicKey, claim, needsTrustline);

        setTxStatus('signing');
        const freighter = await import('@stellar/freighter-api');
        const signed = await Promise.race([
          freighter.signTransaction(xdr, {
            networkPassphrase: NETWORK_PASSPHRASE,
            address: publicKey,
          }),
          new Promise<{ signedTxXdr: ''; signerAddress: ''; error: string }>(
            (resolve) =>
              setTimeout(
                () =>
                  resolve({
                    signedTxXdr: '',
                    signerAddress: '',
                    error: 'Freighter timed out — is the extension unlocked?',
                  }),
                SIGN_TIMEOUT_MS,
              ),
          ),
        ]);

        if (signed.error) {
          throw new Error(signed.error);
        }

        setTxStatus('submitting');
        const { hash } = await submitBatchTx(signed.signedTxXdr);
        setTxHash(hash);
        setTxStatus('success');

        setClaimStatuses((p) => ({ ...p, [claim.balanceId]: 'claimed' }));

        // Reload after success
        setTimeout(() => loadClaims(publicKey), 2000);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Claim failed';
        setTxError(msg);
        setTxStatus('error');
        setClaimStatuses((p) => ({ ...p, [claim.balanceId]: 'claim-failed' }));
      }
    },
    [publicKey, loadClaims],
  );

  if (!publicKey) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-space-grotesk text-3xl font-bold text-on-surface mb-4">
            Claim Your Pay
          </h1>
          <p className="text-on-surface-muted mb-8 max-w-sm mx-auto">
            Connect Freighter to see and claim any payroll waiting for you on Stellar testnet.
          </p>
          <ConnectWallet {...wallet} />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-8 space-y-6">
        <div>
          <h1 className="font-space-grotesk text-2xl font-bold text-on-surface">
            Pending Claims
          </h1>
          <p className="mt-1 text-sm text-on-surface-muted font-mono">
            {publicKey.slice(0, 8)}…{publicKey.slice(-6)}
          </p>
        </div>

        {pageState === 'loading-claims' && (
          <div className="flex items-center gap-3 text-sm text-on-surface-muted">
            <span className="animate-spin">⟳</span> Checking for pending claims…
          </div>
        )}

        {pageState === 'empty' && (
          <div className="space-y-4">
            <EmptyState variant="claims" />
            <button
              onClick={() => loadClaims(publicKey)}
              className="text-sm text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
            >
              ↻ Refresh
            </button>
          </div>
        )}

        {pageState === 'listed' && claims.length > 0 && (
          <>
            <ClaimList
              claims={claims}
              onClaim={handleClaim}
              claimStatuses={claimStatuses}
            />
            <button
              onClick={() => loadClaims(publicKey)}
              className="text-sm text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
            >
              ↻ Refresh claims
            </button>
          </>
        )}

        <StatusPanel
          status={txStatus}
          hash={txHash}
          error={txError}
          recipientCount={1}
        />
      </main>
    </>
  );
}
