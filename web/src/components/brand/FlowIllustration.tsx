interface Props {
  className?: string;
}

export default function FlowIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 480 300"
      fill="none"
      aria-label="Payment flow diagram: employer sends to multiple employees"
      className={className}
    >
      {/* Employer node */}
      <circle cx="80" cy="150" r="36" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <text x="80" y="154" textAnchor="middle" className="fill-primary font-medium text-xs" fontSize="11">
        Employer
      </text>

      {/* Branching paths — stroke-dasharray ready for GSAP draw animation */}
      {/* Top path → payment */}
      <path
        id="flow-path-top"
        d="M116 130 C200 60, 280 60, 380 80"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 4"
        className="text-success"
      />
      {/* Middle path → path payment */}
      <path
        id="flow-path-mid"
        d="M116 150 L380 150"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 4"
        className="text-primary"
      />
      {/* Bottom path → claimable balance */}
      <path
        id="flow-path-bot"
        d="M116 170 C200 240, 280 240, 380 220"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 4"
        className="text-accent"
      />

      {/* Labels on paths */}
      <text x="248" y="72" textAnchor="middle" fontSize="9" className="fill-success">Direct XLM</text>
      <text x="248" y="144" textAnchor="middle" fontSize="9" className="fill-primary">USDC swap</text>
      <text x="248" y="254" textAnchor="middle" fontSize="9" className="fill-accent">Async CB</text>

      {/* Employee nodes */}
      {[
        { cx: 400, cy: 80, label: 'Alice' },
        { cx: 400, cy: 150, label: 'Bob' },
        { cx: 400, cy: 220, label: 'Carol' },
      ].map((n) => (
        <g key={n.label}>
          <circle cx={n.cx} cy={n.cy} r="28" stroke="currentColor" strokeWidth="1.5" className="text-border" fill="var(--surface)" />
          <text x={n.cx} y={n.cy + 4} textAnchor="middle" fontSize="10" className="fill-on-surface">
            {n.label}
          </text>
        </g>
      ))}

      {/* Sender op legend bubble */}
      <rect x="44" y="196" width="72" height="18" rx="9" fill="var(--surface-raised)" stroke="var(--border)" strokeWidth="1" />
      <text x="80" y="209" textAnchor="middle" fontSize="9" className="fill-on-surface-muted">1 signature</text>
    </svg>
  );
}
