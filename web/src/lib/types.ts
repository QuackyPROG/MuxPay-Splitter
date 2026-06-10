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

// ── 002 Payroll types ──────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  address: string;
  memberId?: string;
  salary: string;
  asset: AssetCode;
  active: boolean;
  createdAt: number;
}

export type DeliveryMethod = 'payment' | 'path-payment' | 'claimable-balance';

export type RunStatus =
  | 'draft'
  | 'preflighting'
  | 'ready'
  | 'blocked'
  | 'signing'
  | 'submitting'
  | 'confirmed'
  | 'rejected'
  | 'failed';

export interface PayrollItem {
  employeeId: string;
  name: string;
  destination: string;
  amount: string;
  asset: AssetCode;
  method: DeliveryMethod;
  sendMaxXlm?: string;
  claimableBalanceId?: string;
  claimed?: boolean;
}

export interface PayrollRun {
  id: string;
  createdAt: number;
  txHash?: string;
  status: RunStatus;
  items: PayrollItem[];
  totalXlm: string;
  feeXlm: string;
  reserveXlm: string;
}

export interface WorkspaceSettings {
  companyName?: string;
}

export interface PendingClaim {
  balanceId: string;
  amount: string;
  assetCode: 'XLM' | 'USDC';
  sponsor: string;
  claimableAfter?: number;
}
