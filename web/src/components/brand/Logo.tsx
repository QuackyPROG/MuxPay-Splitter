interface Props {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="MuxPay logo"
      className={className}
    >
      {/* Stellar orbit ring */}
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        opacity="0.4"
      />
      {/* Interlocking M paths */}
      <path
        d="M7 22V10l4.5 6 4.5-6 4.5 6 4.5-6v12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stellar node dot */}
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}
