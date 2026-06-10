'use client';
import { useState, useCallback } from 'react';
import { CheckCircle, ChevronLeft } from 'lucide-react';
import type { Employee, PayrollItem, PayrollRun, RunStatus } from '@/lib/types';
import { preflightRun, buildPayrollXDR, estimateRunCost, resolveClaimableBalanceIds } from '@/lib/payroll';
import { submitBatchTx } from '@/lib/batch';
import { saveRun, updateRun } from '@/lib/storage';
import { fetchBalances } from '@/lib/balances';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import RunPreview from './RunPreview';
import StatusPanel from '@/components/muxpay/StatusPanel';

interface Props {
  employees: Employee[];
  employerAddress: string;
  onBack: () => void;
}

type WizardStep = 'select' | 'preview' | 'sign' | 'result';

const SIGN_TIMEOUT_MS = 5000;

export default function RunWizard({ employees, employerAddress, onBack }: Props) {
  const activeEmployees = employees.filter((e) => e.active);

  const [selected, setSelected] = useState<Set<string>>(
    new Set(activeEmployees.map((e) => e.id)),
  );
  const [step, setStep] = useState<WizardStep>('select');
  const [runStatus, setRunStatus] = useState<RunStatus>('draft');
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [cost, setCost] = useState({ totalXlm: '0', feeXlm: '0', reserveXlm: '0', usdcTotal: '0' });
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  const selectedEmployees = activeEmployees.filter((e) => selected.has(e.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const runPreflight = useCallback(async () => {
    if (selectedEmployees.length === 0) return;
    if (selectedEmployees.length > 10) {
      setBlockReason('Maximum 10 employees per run');
      setRunStatus('blocked');
      setStep('preview');
      return;
    }

    setRunStatus('preflighting');
    setBlockReason(null);
    setStep('preview');

    try {
      const preflighted = await preflightRun(selectedEmployees);
      const runCost = estimateRunCost(preflighted);

      // Check employer balance coverage
      const balances = await fetchBalances(employerAddress);
      const required = parseFloat(runCost.totalXlm) + 1.0;
      const available = parseFloat(balances.xlm);
      if (available < required) {
        const shortfall = (required - available).toFixed(7);
        setBlockReason(`Insufficient XLM — need ${required.toFixed(7)} XLM (${shortfall} XLM short)`);
        setRunStatus('blocked');
        setItems(preflighted);
        setCost(runCost);
        return;
      }

      setItems(preflighted);
      setCost(runCost);
      setRunStatus('ready');
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : 'Preflight failed');
      setRunStatus('failed');
    }
  }, [selectedEmployees, employerAddress]);

  const signAndSubmit = useCallback(async () => {
    if (runStatus !== 'ready' || items.length === 0) return;

    const runId = crypto.randomUUID();
    setCurrentRunId(runId);

    const run: PayrollRun = {
      id: runId,
      createdAt: Date.now(),
      status: 'signing',
      items: [...items],
      totalXlm: cost.totalXlm,
      feeXlm: cost.feeXlm,
      reserveXlm: cost.reserveXlm,
    };
    saveRun(employerAddress, run);

    try {
      setRunStatus('signing');
      setStep('sign');
      setTxError(null);

      const xdr = await buildPayrollXDR(employerAddress, items);

      const freighter = await import('@stellar/freighter-api');
      const signed = await Promise.race([
        freighter.signTransaction(xdr, {
          networkPassphrase: NETWORK_PASSPHRASE,
          address: employerAddress,
        }),
        new Promise<{ signedTxXdr: ''; signerAddress: ''; error: string }>(
          (resolve) =>
            setTimeout(
              () =>
                resolve({
                  signedTxXdr: '',
                  signerAddress: '',
                  error: 'Freighter timed out — is the extension unlocked?',
                }),
              SIGN_TIMEOUT_MS,
            ),
        ),
      ]);

      if (signed.error) {
        // User rejected or timeout → back to ready
        setRunStatus('rejected');
        updateRun(employerAddress, { ...run, status: 'rejected' });
        setStep('preview');
        setRunStatus('ready');
        return;
      }

      setRunStatus('submitting');
      updateRun(employerAddress, { ...run, status: 'submitting' });

      const { hash } = await submitBatchTx(signed.signedTxXdr);

      setTxHash(hash);
      setRunStatus('confirmed');
      setStep('result');

      const confirmedRun: PayrollRun = { ...run, status: 'confirmed', txHash: hash };
      updateRun(employerAddress, confirmedRun);

      // Resolve CB IDs best-effort
      const resolved = await resolveClaimableBalanceIds(employerAddress, items);
      setItems(resolved);
      updateRun(employerAddress, { ...confirmedRun, items: resolved });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transaction failed';
      setTxError(msg);
      setRunStatus('failed');
      setStep('result');
      if (currentRunId) {
        updateRun(employerAddress, { ...run, status: 'failed' });
      }
    }
  }, [runStatus, items, employerAddress, cost, currentRunId]);

  // ── Step: Select ────────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-on-surface-muted hover:text-on-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <StepIndicator current={1} />
        </div>

        <h2 className="font-space-grotesk text-xl font-semibold text-on-surface">
          Select Employees
        </h2>

        {activeEmployees.length === 0 ? (
          <p className="text-on-surface-muted text-sm">
            No active employees. Activate employees in the roster to run payroll.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {activeEmployees.map((e) => (
                <label
                  key={e.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 cursor-pointer hover:bg-surface-raised transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(e.id)}
                    onChange={() => toggleSelect(e.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-on-surface">{e.name}</span>
                    <span className="ml-2 tabular-nums text-sm text-on-surface-muted">
                      {e.salary} {e.asset}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {selectedEmployees.length > 10 && (
              <p className="text-sm text-danger" role="alert">
                Maximum 10 employees per run — deselect {selectedEmployees.length - 10}.
              </p>
            )}

            <button
              onClick={runPreflight}
              disabled={selectedEmployees.length === 0 || selectedEmployees.length > 10}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-on-primary hover:bg-primary-hover disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Preview Run →
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Step: Preview ───────────────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setStep('select'); setRunStatus('draft'); }}
            className="flex items-center gap-1 text-sm text-on-surface-muted hover:text-on-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <StepIndicator current={2} />
        </div>

        <h2 className="font-space-grotesk text-xl font-semibold text-on-surface">
          Preview & Confirm
        </h2>

        {runStatus === 'preflighting' && (
          <div className="flex items-center gap-3 text-sm text-on-surface-muted">
            <span className="animate-spin">⟳</span> Running preflight checks…
          </div>
        )}

        {runStatus === 'blocked' && blockReason && (
          <div className="rounded-lg border border-danger bg-danger/5 px-4 py-3">
            <p className="text-sm font-medium text-danger" role="alert">{blockReason}</p>
          </div>
        )}

        {items.length > 0 && <RunPreview items={items} cost={cost} />}

        {runStatus === 'ready' && (
          <button
            onClick={signAndSubmit}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign & Submit →
          </button>
        )}
      </div>
    );
  }

  // ── Step: Signing / Submitting ──────────────────────────────────────────
  if (step === 'sign') {
    return (
      <div className="space-y-4">
        <StepIndicator current={3} />
        <StatusPanel
          status={runStatus === 'signing' ? 'signing' : 'submitting'}
          hash={null}
          error={null}
          recipientCount={items.length}
        />
      </div>
    );
  }

  // ── Step: Result ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <StepIndicator current={4} />
      {runStatus === 'confirmed' && txHash ? (
        <div className="rounded-xl border border-success/30 bg-success/5 p-6 space-y-3">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={20} />
            <p className="font-semibold">Payroll run confirmed</p>
          </div>
          <p className="text-sm text-on-surface-muted">
            {items.length} employee{items.length !== 1 ? 's' : ''} paid in one transaction.
          </p>
          <p className="font-mono text-xs text-on-surface break-all">{txHash}</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-success/20 px-4 py-2 text-sm font-medium text-success hover:bg-success/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
          >
            View on Stellar Expert →
          </a>
          <div className="pt-2">
            <RunPreview items={items} cost={cost} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 space-y-3">
          <p className="font-semibold text-danger">Run failed</p>
          {txError && (
            <p className="text-sm text-on-surface-muted font-mono break-all" role="alert">
              {txError}
            </p>
          )}
          <button
            onClick={() => { setStep('preview'); setRunStatus('ready'); setTxError(null); }}
            className="rounded-lg border border-border px-4 py-2 text-sm text-on-surface hover:bg-surface-raised transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Try again
          </button>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = ['Select', 'Preview', 'Sign', 'Done'];
  return (
    <div className="flex items-center gap-1" aria-label={`Step ${current} of ${steps.length}`}>
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              i + 1 === current
                ? 'bg-primary text-on-primary'
                : i + 1 < current
                ? 'bg-success text-white'
                : 'bg-surface-raised text-on-surface-muted'
            }`}
          >
            {i + 1 < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs ${i + 1 === current ? 'text-on-surface font-medium' : 'text-on-surface-muted'}`}>
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className={`mx-1 h-px w-4 ${i + 1 < current ? 'bg-success' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
