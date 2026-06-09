import { TransactionBuilder, Transaction } from '@stellar/stellar-sdk';
import { horizon, NETWORK_PASSPHRASE } from './stellar';

const SIGN_TIMEOUT_MS = 5000;

export async function signAndSubmit(xdr: string, address: string): Promise<string> {
  const freighter = await import('@stellar/freighter-api');

  const signed = await Promise.race([
    freighter.signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE, address }),
    new Promise<{ signedTxXdr: ''; signerAddress: ''; error: string }>(r =>
      setTimeout(() => r({ signedTxXdr: '', signerAddress: '',
        error: 'Freighter timed out — is the extension unlocked?' }), SIGN_TIMEOUT_MS)
    ),
  ]);

  if (signed.error) throw new Error(signed.error);
  if (!signed.signedTxXdr) throw new Error('Signing cancelled');

  const tx = TransactionBuilder.fromXDR(signed.signedTxXdr, NETWORK_PASSPHRASE) as Transaction;
  const res = await horizon.submitTransaction(tx);

  if (!res.successful) {
    const codes = (res as any).extras?.result_codes;
    throw new Error(codes ? JSON.stringify(codes) : 'Transaction failed');
  }
  return res.hash;
}
