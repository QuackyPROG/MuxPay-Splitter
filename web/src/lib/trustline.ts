import { TransactionBuilder, Operation, Asset, BASE_FEE } from '@stellar/stellar-sdk';
import { server, horizon, NETWORK_PASSPHRASE, USDC_ISSUER } from './stellar';
import { getBaseFromMuxed } from './muxed';

/**
 * Build an unsigned changeTrust transaction that lets the account hold USDC.
 * A trustline is REQUIRED before an account can receive any non-native asset.
 */
export async function buildAddUsdcTrustlineXDR(account: string): Promise<string> {
  if (!USDC_ISSUER) throw new Error('USDC issuer is not configured (.env.local)');

  const usdc = new Asset('USDC', USDC_ISSUER);
  const acct = await server.getAccount(account);

  const tx = new TransactionBuilder(acct, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset: usdc }))
    .setTimeout(60)
    .build();

  return tx.toXDR();
}

/** Check if an address (G... or M...) has a USDC trustline. */
export async function hasTrustline(address: string): Promise<boolean> {
  const base = getBaseFromMuxed(address);
  try {
    const acct = await horizon.loadAccount(base);
    return acct.balances.some(
      (b) =>
        b.asset_type !== 'native' &&
        (b as any).asset_code === 'USDC' &&
        (b as any).asset_issuer === USDC_ISSUER,
    );
  } catch {
    return false;
  }
}
