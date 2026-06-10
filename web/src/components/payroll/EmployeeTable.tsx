'use client';
import { Pencil, Trash2 } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { buildMuxedAddress } from '@/lib/muxed';

interface Props {
  employees: Employee[];
  onEdit: (e: Employee) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export default function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-raised text-on-surface-muted text-xs uppercase tracking-wide">
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Address</th>
            <th className="px-4 py-3 text-right tabular-nums">Salary</th>
            <th className="px-4 py-3 text-center">Active</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employees.map((e) => {
            const dest =
              e.address.startsWith('G') && e.memberId
                ? buildMuxedAddress(e.address, e.memberId)
                : e.address;
            return (
              <tr
                key={e.id}
                className={`bg-surface transition-colors hover:bg-surface-raised ${
                  !e.active ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-on-surface">
                  {e.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-on-surface-muted max-w-[180px] truncate">
                  <span title={dest}>{dest.slice(0, 8)}…{dest.slice(-6)}</span>
                  {e.memberId && (
                    <span className="ml-1 rounded bg-accent/10 px-1 text-accent text-[10px]">
                      M
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-on-surface">
                  {e.salary} {e.asset}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggleActive(e.id)}
                    aria-label={e.active ? 'Deactivate employee' : 'Activate employee'}
                    className={`h-5 w-10 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      e.active ? 'bg-success' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5 ${
                        e.active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(e)}
                      aria-label={`Edit ${e.name}`}
                      className="rounded p-1.5 text-on-surface-muted hover:bg-surface-raised hover:text-on-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      aria-label={`Delete ${e.name}`}
                      className="rounded p-1.5 text-on-surface-muted hover:bg-danger/10 hover:text-danger transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
