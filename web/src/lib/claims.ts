import { TransactionBuilder, Operation } from '@stellar/stellar-sdk';
import { horizon, NETWORK_PASSPHRASE, USDC } from './stellar';
import type { PendingClaim } from './types';

export type { PendingClaim };

export async function fetchPendingClaims(address: string): Promise<PendingClaim[]> {
  try {
    const res = await horizon
      .claimableBalances()
      .claimant(address)
      .limit(50)
      .call();

    return res.records.map((b) => {
      let assetCode: 'XLM' | 'USDC' = 'XLM';
      if (b.asset !== 'native') {
        const [code] = b.asset.split(':');
        if (code === 'USDC') assetCode = 'USDC';
      }
      return {
        balanceId: b.id,
        amount: b.amount,
        assetCode,
        sponsor: b.sponsor ?? '',
      };
    });
  } catch {
    return [];
  }
}

export async function buildClaimXDR(
  claimerAddress: string,
  claim: PendingClaim,
  needsTrustline: boolean,
): Promise<string> {
  const account = await horizon.loadAccount(claimerAddress);

  const builder = new TransactionBuilder(account, {
    fee: needsTrustline ? '300' : '200',
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (needsTrustline) {
    builder.addOperation(Operation.changeTrust({ asset: USDC }));
  }

  builder.addOperation(
    Operation.claimClaimableBalance({ balanceId: claim.balanceId }),
  );

  return builder.setTimeout(60).build().toXDR();
}
