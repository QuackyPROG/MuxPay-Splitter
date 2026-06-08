import { Asset } from '@stellar/stellar-sdk';
import { horizon, XLM, USDC } from './stellar';

export interface PathResult {
  found: boolean;
  path: Asset[];
  sendMaxEstimate: string;
}

const EMPTY: PathResult = { found: false, path: [], sendMaxEstimate: '0' };

export async function findXlmToUsdcPath(destAmount: string): Promise<PathResult> {
  try {
    const res = await horizon
      .strictReceivePaths([XLM], USDC, destAmount)
      .call();
    const record = res.records[0];
    if (!record) return EMPTY;

    // 5% slippage buffer on sendMax
    const sendMax = (parseFloat(record.source_amount) * 1.05).toFixed(7);

    const path: Asset[] = (record.path ?? []).map((p: any) =>
      p.asset_type === 'native'
        ? Asset.native()
        : new Asset(p.asset_code, p.asset_issuer),
    );

    return { found: true, path, sendMaxEstimate: sendMax };
  } catch {
    return EMPTY;
  }
}
