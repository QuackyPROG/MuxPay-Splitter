'use client';
import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { parseCSV } from '@/lib/batch';
import { isValidAddress } from '@/lib/muxed';

interface Props {
  onImport: (employees: Employee[]) => void;
}

interface ParsedRow {
  name: string;
  address: string;
  salary: string;
  asset: 'XLM' | 'USDC';
  memberId?: string;
  error?: string;
}

function parseEmployeeCSV(csv: string): ParsedRow[] {
  const rows = parseCSV(csv);
  return rows.map((r) => {
    const errors: string[] = [];
    if (!r.address || !isValidAddress(r.address)) errors.push('Invalid address');
    if (!r.amount || parseFloat(r.amount) <= 0) errors.push('Invalid salary');
    if (r.memberId && !/^\d+$/.test(r.memberId)) errors.push('Member ID must be digits');
    return {
      name: r.id,
      address: r.address,
      salary: r.amount,
      asset: r.asset,
      memberId: r.memberId,
      error: errors.length ? errors.join('; ') : undefined,
    };
  });
}

export default function CsvImport({ onImport }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRows(parseEmployeeCSV(text));
    };
    reader.readAsText(file);
  }

  function handleImport() {
    const valid = rows.filter((r) => !r.error);
    const employees: Employee[] = valid.map((r) => ({
      id: crypto.randomUUID(),
      name: r.name,
      address: r.address,
      memberId: r.memberId,
      salary: r.salary,
      asset: r.asset,
      active: true,
      createdAt: Date.now(),
    }));
    onImport(employees);
    setRows([]);
    setFileName('');
  }

  const hasErrors = rows.some((r) => r.error);
  const validCount = rows.filter((r) => !r.error).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-on-surface-muted">
        CSV format: <code className="bg-surface-raised px-1 rounded text-[11px]">name, address, salary, asset[, memberId]</code>
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-on-surface-muted hover:border-primary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Upload size={16} />
        {fileName || 'Choose CSV file'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-label="Import employees from CSV"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {rows.length > 0 && (
        <div className="space-y-2">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-raised text-on-surface-muted">
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-right tabular-nums">Salary</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className={`bg-surface ${r.error ? 'bg-danger/5' : ''}`}
                  >
                    <td className="px-3 py-2 text-on-surface">{r.name}</td>
                    <td className="px-3 py-2 font-mono text-on-surface-muted">
                      {r.address ? `${r.address.slice(0, 8)}…` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-on-surface">
                      {r.salary} {r.asset}
                    </td>
                    <td className="px-3 py-2">
                      {r.error ? (
                        <span className="text-danger" role="alert">{r.error}</span>
                      ) : (
                        <span className="text-success">✓ Valid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={validCount === 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-hover disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Import {validCount} employee{validCount !== 1 ? 's' : ''}
            </button>
            {hasErrors && (
              <p className="text-xs text-warning">
                {rows.filter((r) => r.error).length} row(s) with errors will be skipped
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
