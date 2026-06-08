'use client';
import { useState } from 'react';
import type { Recipient, AssetCode } from '@/lib/types';
import { isValidAddress, buildMuxedAddress } from '@/lib/muxed';
import { parseCSV } from '@/lib/batch';

const DEMO_CSV = `# name, address, amount, asset[, memberId]
Maria Cruz,GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN,5.00,XLM
Juan Dela Cruz,GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN,3.00,XLM,12345
Ana Reyes,GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5,10.00,USDC`;

interface Row {
  id: string;
  address: string;
  amount: string;
  asset: AssetCode;
  memberId: string;
}

const BLANK: Row = { id: '', address: '', amount: '', asset: 'XLM', memberId: '' };

function rowError(r: Row): string | undefined {
  if (!r.id.trim()) return 'Name required';
  if (!r.address.trim() || !isValidAddress(r.address.trim())) return 'Invalid address';
  const n = parseFloat(r.amount);
  if (isNaN(n) || n <= 0) return 'Amount must be > 0';
  if (!/^\d+(\.\d{1,7})?$/.test(r.amount)) return 'Max 7 decimal places';
  if (r.memberId && !/^\d+$/.test(r.memberId)) return 'Member ID must be numeric';
}

function rowToRecipient(r: Row): Recipient {
  const address = r.address.trim();
  let muxed: string | undefined;

  if (r.memberId && address.startsWith('G')) {
    try { muxed = buildMuxedAddress(address, r.memberId); } catch { /* invalid */ }
  } else if (address.startsWith('M')) {
    muxed = address;
  }

  return {
    id: r.id.trim(),
    address,
    muxed,
    memberId: r.memberId || undefined,
    amount: r.amount,
    asset: r.asset,
    needsConversion: r.asset === 'USDC',
    trustlineOk: true,
    pathFound: false,
    preflightDone: false,
    validationError: rowError(r),
  };
}

interface Props {
  onChange: (rows: Recipient[]) => void;
}

export default function RecipientEditor({ onChange }: Props) {
  const [rows, setRows] = useState<Row[]>([{ ...BLANK }]);
  const [csv, setCsv] = useState('');
  const [showCsv, setShowCsv] = useState(false);
  const [parseError, setParseError] = useState('');

  const emit = (next: Row[]) => {
    setRows(next);
    onChange(next.map(rowToRecipient));
  };

  const update = (i: number, patch: Partial<Row>) =>
    emit(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addRow = () => emit([...rows, { ...BLANK }]);

  const removeRow = (i: number) =>
    emit(rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows);

  const parseCsv = () => {
    setParseError('');
    const parsed = parseCSV(csv);
    if (!parsed.length) { setParseError('No valid rows found.'); return; }
    const next: Row[] = parsed.map((p) => ({
      id: p.id,
      address: p.address,
      amount: p.amount,
      asset: p.asset,
      memberId: p.memberId ?? '',
    }));
    emit(next);
    setShowCsv(false);
  };

  return (
    <div className="rounded border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recipients</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCsv((v) => !v)}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
          >
            {showCsv ? 'Manual entry' : 'Paste CSV'}
          </button>
          <button
            onClick={() => { setCsv(DEMO_CSV); setShowCsv(true); }}
            className="rounded border border-indigo-300 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
          >
            Load demo
          </button>
        </div>
      </div>

      {showCsv && (
        <div className="mb-4">
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={6}
            placeholder="name, address, amount, asset[, memberId]"
            className="w-full rounded border border-gray-300 p-3 font-mono text-xs text-gray-800 focus:outline-indigo-400"
          />
          {parseError && <p className="mt-1 text-sm text-red-600">{parseError}</p>}
          <button
            onClick={parseCsv}
            className="mt-2 rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700"
          >
            Parse CSV
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <th className="pb-2 pr-2 w-24">Name</th>
              <th className="pb-2 pr-2">Address (G… or M…)</th>
              <th className="pb-2 pr-2 w-24">Amount</th>
              <th className="pb-2 pr-2 w-20">Asset</th>
              <th className="pb-2 pr-2 w-28">Member ID</th>
              <th className="pb-2 w-6"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const err = rowError(r);
              return (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 pr-2">
                    <input
                      value={r.id}
                      onChange={(e) => update(i, { id: e.target.value })}
                      placeholder="Maria Cruz"
                      className="w-full rounded border border-gray-200 px-2 py-1 text-gray-900 focus:outline-indigo-400"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      value={r.address}
                      onChange={(e) => update(i, { address: e.target.value })}
                      placeholder="G… or M…"
                      className={`w-full rounded border px-2 py-1 font-mono text-xs text-gray-900 focus:outline-indigo-400 ${
                        r.address && !isValidAddress(r.address.trim())
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      value={r.amount}
                      onChange={(e) => update(i, { amount: e.target.value })}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.0000001"
                      className="w-full rounded border border-gray-200 px-2 py-1 text-gray-900 focus:outline-indigo-400"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <select
                      value={r.asset}
                      onChange={(e) => update(i, { asset: e.target.value as AssetCode })}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-gray-900 focus:outline-indigo-400"
                    >
                      <option value="XLM">XLM</option>
                      <option value="USDC">USDC</option>
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      value={r.memberId}
                      onChange={(e) => update(i, { memberId: e.target.value })}
                      placeholder="numeric (optional)"
                      className="w-full rounded border border-gray-200 px-2 py-1 font-mono text-xs text-gray-900 focus:outline-indigo-400"
                    />
                  </td>
                  <td className="py-1.5">
                    <button
                      onClick={() => removeRow(i)}
                      title="Remove row"
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </td>
                  {err && (
                    <td colSpan={6} className="py-0 pb-1.5 text-xs text-red-500">
                      {err}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        disabled={rows.length >= 10}
        className="mt-3 text-sm text-indigo-600 hover:underline disabled:text-gray-400"
      >
        + Add recipient {rows.length >= 10 && '(max 10)'}
      </button>
    </div>
  );
}
