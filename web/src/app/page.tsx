import AppHeader from '@/components/AppHeader';
import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import HowItWorks from '@/components/landing/HowItWorks';
import Proof from '@/components/landing/Proof';
import Cta from '@/components/landing/Cta';
import Logo from '@/components/brand/Logo';
import LandingAnimations from './LandingAnimations';

export default function Home() {
  return (
    <>
      <AppHeader transparent />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Proof />
        <Cta />
      </main>
      <footer className="relative border-t border-border py-10 text-center overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--primary), transparent)',
            opacity: 0.3,
          }}
          aria-hidden
        />
        <div className="flex items-center justify-center gap-2 text-on-surface-muted text-sm mb-1">
          <Logo size={14} className="text-primary opacity-60" />
          <span>MuxPay</span>
          <span className="opacity-40">·</span>
          <span>Stellar testnet</span>
          <span className="opacity-40">·</span>
          <span>StellarX PH workshop</span>
        </div>
        <p className="text-xs text-on-surface-muted opacity-40 mt-1">
          Noncustodial · Open source · No backend
        </p>
      </footer>
      {/* GSAP animation layer — client-only, lazy */}
      <LandingAnimations />
    </>
  );
}
