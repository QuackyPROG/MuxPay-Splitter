'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import ConnectWallet from '@/components/ConnectWallet';
import EmptyState from '@/components/brand/EmptyState';
import RunHistory from '@/components/payroll/RunHistory';
import EmployeeTable from '@/components/payroll/EmployeeTable';
import EmployeeFormModal from '@/components/payroll/EmployeeFormModal';
import CsvImport from '@/components/payroll/CsvImport';
import { useWallet } from '@/hooks/useWallet';
import { fetchBalances } from '@/lib/balances';
import {
  loadEmployees,
  saveEmployees,
  loadRuns,
} from '@/lib/storage';
import type { Employee, PayrollRun } from '@/lib/types';

export default function DashboardClient() {
  const wallet = useWallet();
  const { publicKey } = wallet;

  const [xlm, setXlm] = useState('0.00');
  const [usdc, setUsdc] = useState('0.00');
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balancesError, setBalancesError] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Reload workspace when wallet changes
  useEffect(() => {
    if (!publicKey) {
      setEmployees([]);
      setRuns([]);
      setXlm('0.00');
      setUsdc('0.00');
      return;
    }
    setEmployees(loadEmployees(publicKey));
    setRuns(loadRuns(publicKey));

    setBalancesLoading(true);
    setBalancesError(null);
    fetchBalances(publicKey)
      .then((b) => {
        setXlm(b.xlm);
        setUsdc(b.usdc);
      })
      .catch((e: unknown) =>
        setBalancesError(e instanceof Error ? e.message : 'Failed to load balances'),
      )
      .finally(() => setBalancesLoading(false));
  }, [publicKey]);

  function handleSaveEmployee(emp: Employee) {
    if (!publicKey) return;
    const next = employees.some((e) => e.id === emp.id)
      ? employees.map((e) => (e.id === emp.id ? emp : e))
      : [...employees, emp];
    setEmployees(next);
    saveEmployees(publicKey, next);
    setShowAddForm(false);
    setEditingEmployee(null);
  }

  function handleImportEmployees(imported: Employee[]) {
    if (!publicKey) return;
    const next = [...employees, ...imported];
    setEmployees(next);
    saveEmployees(publicKey, next);
  }

  function handleDeleteEmployee(id: string) {
    if (!publicKey) return;
    const next = employees.filter((e) => e.id !== id);
    setEmployees(next);
    saveEmployees(publicKey, next);
  }

  function handleToggleActive(id: string) {
    if (!publicKey) return;
    const next = employees.map((e) =>
      e.id === id ? { ...e, active: !e.active } : e,
    );
    setEmployees(next);
    saveEmployees(publicKey, next);
  }

  // ── Not connected ──────────────────────────────────────────────────────
  if (!publicKey) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="font-space-grotesk text-3xl font-bold text-on-surface mb-4">
            Company Payroll Dashboard
          </h1>
          <p className="text-on-surface-muted mb-8 max-w-md mx-auto">
            Connect your Freighter wallet to manage your employee roster and run
            payroll on Stellar testnet.
          </p>
          <ConnectWallet {...wallet} />
          {wallet.error && (
            <p className="mt-3 text-sm text-danger" role="alert">
              {wallet.error}
            </p>
          )}
        </main>
      </>
    );
  }

  // ── Connected ──────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">

        {/* Wallet + balances */}
        <section className="flex flex-wrap items-start gap-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-muted mb-1">Connected wallet</p>
            <p className="font-mono text-sm text-on-surface break-all">{publicKey}</p>
          </div>
          <div className="flex gap-6 shrink-0">
            <BalanceTile
              label="XLM"
              value={xlm}
              loading={balancesLoading}
              error={balancesError}
            />
            <BalanceTile
              label="USDC"
              value={usdc}
              loading={balancesLoading}
              error={balancesError}
            />
          </div>
          <div className="w-full flex justify-end">
            <ConnectWallet {...wallet} />
          </div>
        </section>

        {/* Run payroll CTA */}
        <div className="flex items-center justify-between">
          <h2 className="font-space-grotesk text-xl font-semibold text-on-surface">
            Employee Roster
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-lg bg-surface-raised border border-border px-4 py-2 text-sm text-on-surface hover:bg-border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              + Add Employee
            </button>
            {employees.filter((e) => e.active).length > 0 && (
              <Link
                href="/dashboard/run"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Run Payroll →
              </Link>
            )}
          </div>
        </div>

        {/* Roster */}
        {employees.length === 0 ? (
          <EmptyState variant="roster" />
        ) : (
          <EmployeeTable
            employees={employees}
            onEdit={(e) => setEditingEmployee(e)}
            onDelete={handleDeleteEmployee}
            onToggleActive={handleToggleActive}
          />
        )}

        {/* CSV import */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-medium text-on-surface mb-3">Import from CSV</p>
          <CsvImport onImport={handleImportEmployees} />
        </div>

        {/* History */}
        <section>
          <h2 className="font-space-grotesk text-xl font-semibold text-on-surface mb-4">
            Payroll History
          </h2>
          {runs.length === 0 ? (
            <EmptyState variant="history" />
          ) : (
            <RunHistory runs={runs} employerAddress={publicKey} />
          )}
        </section>
      </main>

      {/* Add / edit employee modal */}
      {(showAddForm || editingEmployee) && (
        <EmployeeFormModal
          employee={editingEmployee ?? undefined}
          onSave={handleSaveEmployee}
          onClose={() => {
            setShowAddForm(false);
            setEditingEmployee(null);
          }}
        />
      )}
    </>
  );
}

function BalanceTile({
  label,
  value,
  loading,
  error,
}: {
  label: string;
  value: string;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="text-right">
      <p className="text-xs text-on-surface-muted">{label}</p>
      {loading ? (
        <div className="mt-1 h-5 w-20 animate-pulse rounded bg-surface-raised" />
      ) : error ? (
        <p className="text-xs text-danger" role="alert">
          Error
        </p>
      ) : (
        <p className="tabular-nums text-lg font-semibold text-on-surface">{value}</p>
      )}
    </div>
  );
}
