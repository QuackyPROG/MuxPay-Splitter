'use client';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import RecipientEditor from '@/components/muxpay/RecipientEditor';
import Preview from '@/components/muxpay/Preview';
import StatusPanel from '@/components/muxpay/StatusPanel';
import type { Recipient, TxStatus } from '@/lib/types';
import { findXlmToUsdcPath } from '@/lib/pathfinder';
import { hasTrustline } from '@/lib/trustline';
import { buildBatchXDR, submitBatchTx, estimateFeeXLM } from '@/lib/batch';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

export default function Home() {
  const wallet = useWallet();
  const { publicKey } = wallet;

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [preflightDone, setPreflightDone] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const validRecipients = recipients.filter((r) => !r.validationError);

  const handleRecipientsChange = useCallback((rows: Recipient[]) => {
    setRecipients(rows);
    setPreflightDone(false);
    setTxStatus('idle');
    setTxHash(null);
    setTxError(null);
  }, []);

  const runPreflight = useCallback(async () => {
    if (!validRecipients.length) return;
    setIsChecking(true);
    setPreflightDone(false);

    const checked = await Promise.all(
      recipients.map(async (r) => {
        if (r.validationError) return r;

        if (r.asset === 'USDC') {
          const [pathResult, trustline] = await Promise.all([
            findXlmToUsdcPath(r.amount),
            hasTrustline(r.muxed ?? r.address),
          ]);
          return {
            ...r,
            needsConversion: true,
            pathFound: pathResult.found,
            pathAssets: pathResult.found ? pathResult.path : undefined,
            sendMaxEstimate: pathResult.found ? pathResult.sendMaxEstimate : undefined,
            trustlineOk: trustline,
            preflightDone: true,
          };
        }

        return { ...r, pathFound: true, trustlineOk: true, preflightDone: true };
      }),
    );

    setRecipients(checked);
    setPreflightDone(true);
    setIsChecking(false);
  }, [recipients, validRecipients.length]);

  const createAndSign = useCallback(async () => {
    if (!publicKey) return;
    const ready = recipients.filter((r) => !r.validationError);
    if (!ready.length) return;

    setTxStatus('building');
    setTxError(null);
    setTxHash(null);

    try {
      const xdr = await buildBatchXDR(publicKey, ready);

      setTxStatus('signing');
      // Dynamic import only — static import breaks SSR
      const freighter = await import('@stellar/freighter-api');
      const SIGN_TIMEOUT = 5000;
      const signed = await Promise.race([
        freighter.signTransaction(xdr, {
          networkPassphrase: NETWORK_PASSPHRASE,
          address: publicKey,
        }),
        new Promise<{ signedTxXdr: ''; signerAddress: ''; error: string }>(r =>
          setTimeout(() => r({ signedTxXdr: '', signerAddress: '',
            error: 'Freighter timed out — is the extension unlocked?' }), SIGN_TIMEOUT)
        ),
      ]);
      if (signed.error) {
        throw new Error(typeof signed.error === 'string' ? signed.error : 'Signing rejected');
      }

      setTxStatus('submitting');
      const { hash } = await submitBatchTx(signed.signedTxXdr);
      setTxHash(hash);
      setTxStatus('success');
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : 'Transaction failed');
      setTxStatus('error');
    }
  }, [publicKey, recipients]);

  const hasBlockers =
    preflightDone &&
    recipients.some(
      (r) =>
        r.preflightDone &&
        (!r.trustlineOk || (r.asset === 'USDC' && !r.pathFound)),
    );

  const busy = ['building', 'signing', 'submitting'].includes(txStatus);

  const canSubmit =
    publicKey &&
    preflightDone &&
    validRecipients.length > 0 &&
    !hasBlockers &&
    !busy;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MuxPay Splitter</h1>
            <p className="text-sm text-gray-500">
              Atomic batch payout · up to 10 recipients · one Freighter signature
            </p>
          </div>
          <ConnectWallet {...wallet} />
        </header>

        {/* Not connected */}
        {!publicKey && (
          <div className="rounded border border-gray-200 bg-white py-16 text-center text-gray-500">
            <p className="mb-2 font-medium text-gray-700">
              Connect your Freighter wallet to get started.
            </p>
            <p className="text-sm">
              No wallet?{' '}
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Install Freighter
              </a>{' '}
              and switch to Testnet.
            </p>
          </div>
        )}

        {/* Connected */}
        {publicKey && (
          <div className="space-y-6">
            {/* Sender info */}
            <div className="flex flex-wrap items-center gap-4 rounded border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
              <span>
                Sender:{' '}
                <span className="font-mono text-xs text-gray-800">{publicKey}</span>
              </span>
              <span className="ml-auto text-gray-400">Stellar testnet</span>
            </div>

            {/* Recipient editor */}
            <RecipientEditor onChange={handleRecipientsChange} />

            {/* Check & Preview row */}
            {validRecipients.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={runPreflight}
                  disabled={isChecking || busy}
                  className="rounded bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isChecking ? 'Checking…' : 'Check & Preview'}
                </button>
                <span className="text-sm text-gray-400">
                  {validRecipients.length} recipient
                  {validRecipients.length !== 1 ? 's' : ''} · est. fee{' '}
                  {estimateFeeXLM(validRecipients.length)} XLM
                </span>
              </div>
            )}

            {/* Preview panel */}
            {preflightDone && <Preview recipients={recipients.filter((r) => !r.validationError)} />}

            {/* Create & Sign row */}
            {preflightDone && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={createAndSign}
                  disabled={!canSubmit}
                  className="rounded bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy ? 'Processing…' : 'Create & Sign'}
                </button>
                {hasBlockers && (
                  <p className="text-sm text-red-600">
                    Resolve warnings above before submitting.
                  </p>
                )}
                {!hasBlockers && !busy && (
                  <p className="text-sm text-gray-500">
                    One Freighter prompt · all ops atomic
                  </p>
                )}
              </div>
            )}

            {/* Status panel */}
            <StatusPanel
              status={txStatus}
              hash={txHash}
              error={txError}
              recipientCount={validRecipients.length}
            />
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-gray-400">
          MuxPay Splitter · StellarX PH workshop @ PUP QC · Track 2 Financial
          Inclusion
        </footer>
      </div>
    </main>
  );
}
