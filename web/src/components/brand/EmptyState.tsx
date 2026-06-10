type Variant = 'roster' | 'history' | 'claims';

interface Props {
  variant: Variant;
  className?: string;
}

function RosterIllustration() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden>
      <rect x="10" y="20" width="100" height="12" rx="6" fill="currentColor" opacity="0.12" />
      <rect x="10" y="38" width="80" height="10" rx="5" fill="currentColor" opacity="0.08" />
      <rect x="10" y="54" width="60" height="10" rx="5" fill="currentColor" opacity="0.06" />
      <circle cx="96" cy="26" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.3" />
      <path d="M92 26l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </svg>
  );
}

function HistoryIllustration() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden>
      <rect x="20" y="10" width="80" height="60" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <rect x="30" y="24" width="60" height="8" rx="4" fill="currentColor" opacity="0.12" />
      <rect x="30" y="38" width="45" height="7" rx="3.5" fill="currentColor" opacity="0.08" />
      <rect x="30" y="51" width="30" height="7" rx="3.5" fill="currentColor" opacity="0.06" />
      <circle cx="90" cy="20" r="8" fill="currentColor" opacity="0.08" />
      <path d="M87 20l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}

function ClaimsIllustration() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden>
      <circle cx="60" cy="40" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.25" />
      <circle cx="60" cy="40" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M54 40h12M60 34v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <circle cx="60" cy="16" r="4" fill="currentColor" opacity="0.15" />
      <circle cx="60" cy="64" r="4" fill="currentColor" opacity="0.15" />
      <circle cx="38" cy="40" r="4" fill="currentColor" opacity="0.15" />
      <circle cx="82" cy="40" r="4" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

const LABELS: Record<Variant, string> = {
  roster: 'No employees yet',
  history: 'No payroll runs yet',
  claims: 'No pending claims',
};

export default function EmptyState({ variant, className }: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-3 py-10 text-on-surface-muted ${className ?? ''}`}
    >
      <div className="text-on-surface-muted">
        {variant === 'roster' && <RosterIllustration />}
        {variant === 'history' && <HistoryIllustration />}
        {variant === 'claims' && <ClaimsIllustration />}
      </div>
      <p className="text-sm">{LABELS[variant]}</p>
    </div>
  );
}
