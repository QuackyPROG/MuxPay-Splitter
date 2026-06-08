'use client';
import type { Recipient } from '@/lib/types';
import { estimateFeeXLM } from '@/lib/batch';

function PathBadge({ r }: { r: Recipient }) {
  if (r.asset === 'XLM')
    return (
      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
        Direct XLM
      </span>
    );
  if (!r.preflightDone)
    return <span className="text-xs text-gray-400">Checking…</span>;
  if (r.pathFound)
    return (
      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
        DEX path ✓
      </span>
    );
  return (
    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
      No DEX route ✗
    </span>
  );
}

function TrustlineBadge({ r }: { r: Recipient }) {
  if (r.asset === 'XLM' || !r.preflightDone) return null;
  if (r.trustlineOk)
    return (
      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
        Trustline ✓
      </span>
    );
  return (
    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
      No trustline ✗
    </span>
  );
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Preview({ recipients }: { recipients: Recipient[] }) {
  const xlmDirect = recipients
    .filter((r) => r.asset === 'XLM')
    .reduce((s, r) => s + parseFloat(r.amount || '0'), 0);

  const usdcDest = recipients
    .filter((r) => r.asset === 'USDC')
    .reduce((s, r) => s + parseFloat(r.amount || '0'), 0);

  const xlmSendMax = recipients
    .filter((r) => r.asset === 'USDC' && r.sendMaxEstimate)
    .reduce((s, r) => s + parseFloat(r.sendMaxEstimate!), 0);

  const hasBlockers = recipients.some(
    (r) =>
      r.preflightDone &&
      (!r.trustlineOk || (r.asset === 'USDC' && !r.pathFound)),
  );

  const muxedCount = recipients.filter((r) => r.muxed).length;

  return (
    <div className="mt-6 rounded border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Transaction Preview
      </h2>

      {/* Summary row */}
      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
        <span>
          <strong className="text-gray-900">{recipients.length}</strong>{' '}
          operation{recipients.length !== 1 ? 's' : ''}
        </span>
        {xlmDirect > 0 && (
          <span>
            <strong className="text-gray-900">{xlmDirect.toFixed(7)}</strong> XLM
            direct
          </span>
        )}
        {usdcDest > 0 && (
          <span>
            <strong className="text-gray-900">{usdcDest.toFixed(7)}</strong>{' '}
            USDC via DEX (≤{xlmSendMax.toFixed(7)} XLM sendMax)
          </span>
        )}
        {muxedCount > 0 && (
          <span>
            <strong className="text-gray-900">{muxedCount}</strong> muxed{' '}
            {muxedCount === 1 ? 'account' : 'accounts'} (M…)
          </span>
        )}
        <span>
          Est. fee:{' '}
          <strong className="text-gray-900">
            {estimateFeeXLM(recipients.length)}
          </strong>{' '}
          XLM
        </span>
      </div>

      {/* Op table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <th className="pb-2 pr-4">Recipient</th>
              <th className="pb-2 pr-4">Destination</th>
              <th className="pb-2 pr-4">Amount</th>
              <th className="pb-2 pr-4">Op type</th>
              <th className="pb-2">Trustline</th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((r, i) => {
              const blocked =
                r.preflightDone &&
                (!r.trustlineOk || (r.asset === 'USDC' && !r.pathFound));
              const dest = r.muxed ?? r.address;
              return (
                <tr
                  key={i}
                  className={`border-b border-gray-100 ${blocked ? 'bg-red-50' : ''}`}
                >
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {r.id}
                    {r.muxed && (
                      <span className="ml-1 rounded bg-violet-100 px-1.5 py-0.5 text-xs text-violet-700">
                        M…
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-600">
                    {shortAddr(dest)}
                  </td>
                  <td className="py-2 pr-4 text-gray-900">
                    {r.amount} {r.asset}
                    {r.asset === 'USDC' && r.sendMaxEstimate && (
                      <div className="text-xs text-gray-400">
                        sendMax ≤{r.sendMaxEstimate} XLM
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <PathBadge r={r} />
                  </td>
                  <td className="py-2">
                    <TrustlineBadge r={r} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasBlockers && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3">
          <p className="mb-1 text-sm font-medium text-red-800">
            Fix these before submitting:
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-red-700">
            {recipients
              .filter((r) => r.preflightDone && !r.trustlineOk && r.asset === 'USDC')
              .map((r, i) => (
                <li key={i}>
                  <strong>{r.id}</strong>: missing USDC trustline on{' '}
                  {shortAddr(r.address)} — add trustline via Stellar Lab or
                  use the Add Trustline button above.
                </li>
              ))}
            {recipients
              .filter(
                (r) => r.preflightDone && r.asset === 'USDC' && !r.pathFound,
              )
              .map((r, i) => (
                <li key={i}>
                  <strong>{r.id}</strong>: no XLM→USDC DEX route found —
                  testnet liquidity may be low, try a smaller amount.
                </li>
              ))}
          </ul>
        </div>
      )}

      {!hasBlockers && (
        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          All checks passed — ready to sign.
        </div>
      )}
    </div>
  );
}
