import { TransactionBuilder, Operation, Claimant } from '@stellar/stellar-sdk';
import { horizon, NETWORK_PASSPHRASE, XLM, USDC } from './stellar';
import type { Recipient, AssetCode } from './types';

export interface ParsedRow {
  id: string;
  address: string;
  amount: string;
  asset: AssetCode;
  memberId?: string;
  error?: string;
}

export function parseCSV(csv: string): ParsedRow[] {
  return csv
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((line, i) => {
      const cols = line.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 4) {
        return {
          id: `Row ${i + 1}`,
          address: '',
          amount: '',
          asset: 'XLM' as AssetCode,
          error: 'Need ≥ 4 columns: name, address, amount, asset',
        };
      }
      const [id, address, amount, rawAsset, memberId] = cols;
      const asset: AssetCode =
        rawAsset.toUpperCase() === 'USDC' ? 'USDC' : 'XLM';
      return {
        id: id || `Row ${i + 1}`,
        address,
        amount,
        asset,
        memberId: memberId || undefined,
      };
    });
}

export async function buildBatchXDR(
  senderPubKey: string,
  recipients: Recipient[],
): Promise<string> {
  if (!recipients.length) throw new Error('No recipients');
  if (recipients.length > 10) throw new Error('Max 10 recipients per batch');

  // Fresh sequence number right before build to avoid bad_seq
  const account = await horizon.loadAccount(senderPubKey);
  // baseFee × (1 + opCount) as specified in PRD
  const fee = String(100 * (1 + recipients.length));

  const builder = new TransactionBuilder(account, {
    fee,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  for (const r of recipients) {
    const dest = r.muxed ?? r.address;

    if (r.asset === 'USDC' && r.needsConversion && r.pathAssets && r.sendMaxEstimate) {
      builder.addOperation(
        Operation.pathPaymentStrictReceive({
          sendAsset: XLM,
          sendMax: r.sendMaxEstimate,
          destination: dest,
          destAsset: USDC,
          destAmount: r.amount,
          path: r.pathAssets,
        }),
      );
    } else {
      const asset = r.asset === 'USDC' ? USDC : XLM;
      builder.addOperation(
        Operation.payment({ destination: dest, asset, amount: r.amount }),
      );
    }
  }

  return builder.setTimeout(30).build().toXDR();
}

export async function submitBatchTx(
  signedXdr: string,
): Promise<{ hash: string; ledger: number }> {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  try {
    const res = await horizon.submitTransaction(tx as any);
    if (!res.successful) {
      const codes = (res as any).extras?.result_codes;
      throw new Error(codes ? JSON.stringify(codes) : 'Batch transaction failed');
    }
    return { hash: res.hash, ledger: res.ledger };
  } catch (e: any) {
    const codes = e.response?.data?.extras?.result_codes;
    throw new Error(
      codes ? JSON.stringify(codes) : (e.message ?? 'Submit failed'),
    );
  }
}

export function estimateFeeXLM(opCount: number): string {
  return ((100 * (1 + opCount)) / 10_000_000).toFixed(7);
}

/**
 * Build a CreateClaimableBalance op for async payroll delivery.
 * Claimants: employee (unconditional) + employer (reclaim after 7 days).
 */
export function buildClaimableBalanceOp(
  employeeAddress: string,
  employerAddress: string,
  asset: ReturnType<typeof XLM.constructor.prototype.toXDRObject> | typeof XLM | typeof USDC | import('@stellar/stellar-sdk').Asset,
  amount: string,
) {
  return Operation.createClaimableBalance({
    asset: asset as import('@stellar/stellar-sdk').Asset,
    amount,
    claimants: [
      new Claimant(employeeAddress, Claimant.predicateUnconditional()),
      new Claimant(employerAddress, Claimant.predicateNot(Claimant.predicateBeforeRelativeTime('604800'))),
    ],
  });
}
