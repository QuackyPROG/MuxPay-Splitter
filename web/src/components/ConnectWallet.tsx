'use client';
import { useState } from 'react';
import type { WalletState } from '@/hooks/useWallet';

export default function ConnectWallet({
  publicKey,
  connecting,
  error,
  connect,
  disconnect,
}: WalletState) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={copy}
          title="Copy full address"
          className="rounded-lg border border-border bg-surface-raised px-3 py-1.5 font-mono text-xs text-on-surface-muted transition-colors hover:bg-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {copied ? 'Copied!' : `${publicKey.slice(0, 6)}…${publicKey.slice(-6)}`}
        </button>
        <button
          onClick={disconnect}
          className="text-sm text-danger hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connect}
        disabled={connecting}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {connecting ? 'Connecting…' : 'Connect Freighter'}
      </button>
      {error && (
        <p className="mt-2 max-w-xs text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
