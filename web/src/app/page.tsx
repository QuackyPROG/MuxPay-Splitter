import AppHeader from '@/components/AppHeader';
import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import HowItWorks from '@/components/landing/HowItWorks';
import Proof from '@/components/landing/Proof';
import Cta from '@/components/landing/Cta';
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
      <footer className="border-t border-border py-8 text-center text-sm text-on-surface-muted">
        MuxPay · Stellar testnet · StellarX PH workshop
      </footer>
      {/* GSAP animation layer — client-only, lazy */}
      <LandingAnimations />
    </>
  );
}
