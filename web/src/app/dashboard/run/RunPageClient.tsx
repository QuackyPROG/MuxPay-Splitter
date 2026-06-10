'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import ConnectWallet from '@/components/ConnectWallet';
import RunWizard from '@/components/payroll/RunWizard';
import { useWallet } from '@/hooks/useWallet';
import { loadEmployees } from '@/lib/storage';
import type { Employee } from '@/lib/types';

export default function RunPageClient() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (!publicKey) return;
    setEmployees(loadEmployees(publicKey));
  }, [publicKey]);

  const activeEmployees = employees.filter((e) => e.active);

  if (!publicKey) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-space-grotesk text-2xl font-bold text-on-surface mb-4">
            Run Payroll
          </h1>
          <p className="text-on-surface-muted mb-8">
            Connect your Freighter wallet to run payroll.
          </p>
          <ConnectWallet {...wallet} />
        </main>
      </>
    );
  }

  if (activeEmployees.length === 0) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-space-grotesk text-2xl font-bold text-on-surface mb-4">
            Run Payroll
          </h1>
          <p className="text-on-surface-muted mb-8">
            You have no active employees. Add employees to your roster first.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Go to Dashboard
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <RunWizard
          employees={employees}
          employerAddress={publicKey}
          onBack={() => router.push('/dashboard')}
        />
      </main>
    </>
  );
}
