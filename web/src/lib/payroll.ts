import { TransactionBuilder, Operation, Claimant } from '@stellar/stellar-sdk';
import { horizon, NETWORK_PASSPHRASE, XLM, USDC } from './stellar';
import { hasTrustline } from './trustline';
import { findXlmToUsdcPath } from './pathfinder';
import { buildMuxedAddress, getBaseFromMuxed } from './muxed';
import type { Employee, PayrollItem, DeliveryMethod } from './types';

// ── Preflight ──────────────────────────────────────────────────────────────

export async function preflightEmployee(e: Employee): Promise<PayrollItem> {
  const destination =
    e.address.startsWith('G') && e.memberId
      ? buildMuxedAddress(e.address, e.memberId)
      : e.address;
  const baseAddress = getBaseFromMuxed(destination);

  let method: DeliveryMethod;
  let sendMaxXlm: string | undefined;

  try {
    await horizon.loadAccount(baseAddress);
    // Account exists

    if (e.asset === 'XLM') {
      method = 'payment';
    } else {
      // USDC: check trustline + DEX path
      const [trustline, pathResult] = await Promise.all([
        hasTrustline(destination),
        findXlmToUsdcPath(e.salary),
      ]);
      if (trustline && pathResult.found) {
        method = 'path-payment';
        sendMaxXlm = pathResult.sendMaxEstimate;
      } else {
        // No trustline or no path → claimable balance
        method = 'claimable-balance';
      }
    }
  } catch (err: unknown) {
    // 404 = account doesn't exist → claimable balance (no trustline needed at creation)
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404 || (err as { name?: string })?.name === 'NotFoundError') {
      method = 'claimable-balance';
    } else {
      throw err;
    }
  }

  return {
    employeeId: e.id,
    name: e.name,
    destination,
    amount: e.salary,
    asset: e.asset,
    method,
    sendMaxXlm,
  };
}

export async function preflightRun(employees: Employee[]): Promise<PayrollItem[]> {
  return Promise.all(employees.map(preflightEmployee));
}

// ── Build XDR ──────────────────────────────────────────────────────────────

export async function buildPayrollXDR(
  employerAddress: string,
  items: PayrollItem[],
): Promise<string> {
  if (items.length === 0) throw new Error('No payroll items');
  if (items.length > 10) throw new Error('Max 10 ops per run');

  const account = await horizon.loadAccount(employerAddress);
  const fee = String(100 * (1 + items.length));

  const builder = new TransactionBuilder(account, {
    fee,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  for (const item of items) {
    const asset = item.asset === 'USDC' ? USDC : XLM;

    if (item.method === 'payment') {
      builder.addOperation(
        Operation.payment({
          destination: item.destination,
          asset: XLM,
          amount: item.amount,
        }),
      );
    } else if (item.method === 'path-payment' && item.sendMaxXlm) {
      builder.addOperation(
        Operation.pathPaymentStrictReceive({
          sendAsset: XLM,
          sendMax: item.sendMaxXlm,
          destination: item.destination,
          destAsset: USDC,
          destAmount: item.amount,
          path: [],
        }),
      );
    } else {
      // claimable-balance — use base G-address (CB doesn't accept M-addresses)
      const baseEmployee = getBaseFromMuxed(item.destination);
      builder.addOperation(
        Operation.createClaimableBalance({
          asset,
          amount: item.amount,
          claimants: [
            new Claimant(baseEmployee, Claimant.predicateUnconditional()),
            new Claimant(
              employerAddress,
              Claimant.predicateNot(Claimant.predicateBeforeRelativeTime('604800')),
            ),
          ],
        }),
      );
    }
  }

  return builder.setTimeout(60).build().toXDR();
}

// ── Cost estimate ──────────────────────────────────────────────────────────

export function estimateRunCost(items: PayrollItem[]): {
  totalXlm: string;
  feeXlm: string;
  reserveXlm: string;
  usdcTotal: string;
} {
  let xlmPayments = 0;
  let sendMaxTotal = 0;
  let usdcTotal = 0;
  let cbCount = 0;

  for (const item of items) {
    if (item.method === 'payment') {
      xlmPayments += parseFloat(item.amount);
    } else if (item.method === 'path-payment' && item.sendMaxXlm) {
      sendMaxTotal += parseFloat(item.sendMaxXlm);
      usdcTotal += parseFloat(item.amount);
    } else if (item.method === 'claimable-balance') {
      cbCount += 1;
      if (item.asset === 'XLM') {
        xlmPayments += parseFloat(item.amount);
      } else {
        usdcTotal += parseFloat(item.amount);
      }
    }
  }

  const feeXlm = (100 * (1 + items.length)) / 10_000_000;
  // 2 claimants per CB × 0.5 XLM reserve each
  const reserveXlm = cbCount * 2 * 0.5;
  const totalXlm = xlmPayments + sendMaxTotal + feeXlm + reserveXlm;

  return {
    totalXlm: totalXlm.toFixed(7),
    feeXlm: feeXlm.toFixed(7),
    reserveXlm: reserveXlm.toFixed(7),
    usdcTotal: usdcTotal.toFixed(7),
  };
}

// ── Post-confirm: resolve claimable balance IDs ────────────────────────────

export async function resolveClaimableBalanceIds(
  employerAddress: string,
  items: PayrollItem[],
): Promise<PayrollItem[]> {
  try {
    const res = await horizon
      .claimableBalances()
      .sponsor(employerAddress)
      .limit(50)
      .order('desc')
      .call();

    const cbItems = items.filter((i) => i.method === 'claimable-balance');
    const balances = res.records;

    // Match by asset + amount best-effort
    const matched = new Set<string>();
    return items.map((item) => {
      if (item.method !== 'claimable-balance') return item;
      const assetCode = item.asset;
      const match = balances.find((b) => {
        if (matched.has(b.id)) return false;
        const bAsset = b.asset === 'native' ? 'XLM' : b.asset.split(':')[0];
        return (
          bAsset === assetCode &&
          Math.abs(parseFloat(b.amount) - parseFloat(item.amount)) < 0.0000001
        );
      });
      if (match) {
        matched.add(match.id);
        return { ...item, claimableBalanceId: match.id };
      }
      return item;
    });
  } catch {
    return items;
  }
}
