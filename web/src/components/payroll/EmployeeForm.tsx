'use client';
import { useState } from 'react';
import type { Employee, AssetCode } from '@/lib/types';
import { isValidAddress } from '@/lib/muxed';

interface Props {
  initial?: Employee;
  onSave: (e: Employee) => void;
  onCancel: () => void;
}

function validateAmount(v: string): string | null {
  const n = parseFloat(v);
  if (isNaN(n) || n <= 0) return 'Amount must be a positive number';
  if (!/^\d+(\.\d{1,7})?$/.test(v)) return 'Max 7 decimal places';
  return null;
}

export default function EmployeeForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [memberId, setMemberId] = useState(initial?.memberId ?? '');
  const [salary, setSalary] = useState(initial?.salary ?? '');
  const [asset, setAsset] = useState<AssetCode>(initial?.asset ?? 'XLM');

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (name.trim().length > 60) e.name = 'Name must be ≤ 60 characters';
    if (!isValidAddress(address)) e.address = 'Enter a valid G… or M… Stellar address';
    if (memberId && !/^\d+$/.test(memberId))
      e.memberId = 'Member ID must be digits only';
    if (memberId && address.startsWith('M'))
      e.memberId = 'Member ID only applies to G-addresses (M-address already muxed)';
    const amtErr = validateAmount(salary);
    if (amtErr) e.salary = amtErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    const emp: Employee = {
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      address,
      memberId: memberId || undefined,
      salary,
      asset,
      active: initial?.active ?? true,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    onSave(emp);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Full name" error={errors.name}>
        <input
          id="emp-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (!name.trim()) setErrors((p) => ({ ...p, name: 'Name is required' }));
          }}
          maxLength={60}
          className={inputCls(!!errors.name)}
          placeholder="Jane Smith"
        />
      </Field>

      <Field label="Stellar address (G… or M…)" error={errors.address}>
        <input
          id="emp-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onBlur={() => {
            if (address && !isValidAddress(address))
              setErrors((p) => ({ ...p, address: 'Enter a valid G… or M… Stellar address' }));
          }}
          className={inputCls(!!errors.address)}
          placeholder="GABC…"
        />
      </Field>

      <Field
        label="Member ID (optional — G-addresses only)"
        error={errors.memberId}
      >
        <input
          id="emp-member-id"
          type="text"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          onBlur={() => {
            if (memberId && !/^\d+$/.test(memberId))
              setErrors((p) => ({ ...p, memberId: 'Member ID must be digits only' }));
          }}
          className={inputCls(!!errors.memberId)}
          placeholder="12345"
          inputMode="numeric"
        />
      </Field>

      <div className="flex gap-4">
        <Field label="Salary" error={errors.salary} className="flex-1">
          <input
            id="emp-salary"
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            onBlur={() => {
              const err = validateAmount(salary);
              if (err) setErrors((p) => ({ ...p, salary: err }));
            }}
            className={`${inputCls(!!errors.salary)} tabular-nums`}
            placeholder="100.00"
            inputMode="decimal"
          />
        </Field>
        <Field label="Asset" className="w-28">
          <select
            id="emp-asset"
            value={asset}
            onChange={(e) => setAsset(e.target.value as AssetCode)}
            className={inputCls(false)}
          >
            <option value="XLM">XLM</option>
            <option value="USDC">USDC</option>
          </select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {initial ? 'Save changes' : 'Add employee'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-5 py-2 text-sm text-on-surface-muted hover:bg-surface-raised transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm bg-surface text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
    hasError ? 'border-danger' : 'border-border'
  }`;
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-on-surface mb-1">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
