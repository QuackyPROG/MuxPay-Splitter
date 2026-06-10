'use client';
import { useEffect } from 'react';
import type { Employee } from '@/lib/types';
import EmployeeForm from './EmployeeForm';

interface Props {
  employee?: Employee;
  onSave: (e: Employee) => void;
  onClose: () => void;
}

export default function EmployeeFormModal({ employee, onSave, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={employee ? 'Edit employee' : 'Add employee'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-surface border border-border p-6 shadow-xl">
        <h2 className="font-space-grotesk text-lg font-semibold text-on-surface mb-5">
          {employee ? 'Edit Employee' : 'Add Employee'}
        </h2>
        <EmployeeForm
          initial={employee}
          onSave={onSave}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
