'use client';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import ThemeToggle from '@/components/ThemeToggle';

interface Props {
  transparent?: boolean;
}

export default function AppHeader({ transparent }: Props) {
  return (
    <header
      className={`sticky top-0 z-40 flex h-14 items-center gap-4 px-4 sm:px-6 ${
        transparent
          ? 'bg-transparent'
          : 'border-b border-border bg-surface/80 backdrop-blur'
      }`}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
        aria-label="MuxPay home"
      >
        <Logo size={28} />
        <span className="font-space-grotesk font-semibold text-sm tracking-tight">
          MuxPay
        </span>
      </Link>

      <nav className="flex items-center gap-1 ml-4" aria-label="Main navigation">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/claim">Claim</NavLink>
      </nav>

      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-1.5 text-sm text-on-surface-muted hover:bg-surface-raised hover:text-on-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </Link>
  );
}
