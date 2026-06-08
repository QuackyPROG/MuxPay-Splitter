import type { Asset } from '@stellar/stellar-sdk';

export type AssetCode = 'XLM' | 'USDC';

export interface Recipient {
  id: string;
  address: string;
  memberId?: string;
  muxed?: string;
  amount: string;
  asset: AssetCode;
  needsConversion: boolean;
  pathAssets?: Asset[];
  sendMaxEstimate?: string;
  trustlineOk: boolean;
  pathFound: boolean;
  preflightDone: boolean;
  validationError?: string;
}

export type TxStatus =
  | 'idle'
  | 'building'
  | 'signing'
  | 'submitting'
  | 'success'
  | 'error';
