'use client';
import { useEffect, useRef } from 'react';

export default function LandingAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    void (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();

      mm.add(
        {
          notReduced: '(prefers-reduced-motion: no-preference)',
          reduced:    '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { notReduced } = context.conditions as {
            notReduced: boolean;
            reduced: boolean;
          };
          if (!notReduced) return;

          // ── Hero entrance sequence ──────────────────────────────────────
          gsap
            .timeline({ defaults: { ease: 'power3.out' } })
            .from('#hero-logo',        { opacity: 0, scale: 0.55, duration: 0.85 })
            .from('#hero-badge',       { opacity: 0, y: 24, duration: 0.65 }, '-=0.4')
            .from('#hero h1',          { opacity: 0, y: 55, duration: 0.95 }, '-=0.35')
            .from('#hero p',           { opacity: 0, y: 32, duration: 0.80 }, '-=0.55')
            .from('#hero a',           { opacity: 0, y: 22, duration: 0.65, stagger: 0.12 }, '-=0.45')
            .from('.hero-stat-item',   { opacity: 0, y: 20, duration: 0.55, stagger: 0.10 }, '-=0.35');

          // ── Hero background — parallax on scroll ────────────────────────
          gsap.to('#hero-orb-1', {
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
            y: -130, x: -50,
          });
          gsap.to('#hero-orb-2', {
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
            y: -80, x: 60,
          });
          gsap.to('#hero-orb-3', {
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
            y: -60,
          });
          gsap.to('#hero-network', {
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
            y: -55, opacity: 0.03,
          });

          // ── Problem section ─────────────────────────────────────────────
          gsap.from('#problem h2, #problem .text-center.text-on-surface-muted', {
            scrollTrigger: { trigger: '#problem', start: 'top 82%', end: 'top 52%', scrub: 0.4 },
            opacity: 0, y: 30, stagger: 0.06,
          });
          gsap.from('.problem-stat', {
            scrollTrigger: { trigger: '#problem', start: 'top 72%', end: 'top 28%', scrub: 0.5 },
            opacity: 0, y: 65, scale: 0.94, stagger: 0.09,
          });

          // ── HowItWorks ──────────────────────────────────────────────────
          gsap.from('.how-step', {
            scrollTrigger: { trigger: '#how-it-works', start: 'top 75%', end: 'top 30%', scrub: 0.6 },
            opacity: 0, x: -45, stagger: 0.10,
          });

          // Flow diagram card
          gsap.from('#how-it-works .flex.justify-center > div', {
            scrollTrigger: { trigger: '#how-it-works', start: 'top 65%', end: 'top 20%', scrub: 0.5 },
            opacity: 0, x: 55, scale: 0.94,
          });

          // SVG path draw
          const paths = ['#flow-path-top', '#flow-path-mid', '#flow-path-bot'];
          paths.forEach((sel, i) => {
            const el = document.querySelector<SVGPathElement>(sel);
            if (!el) return;
            const len = el.getTotalLength?.() ?? 200;
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
            gsap.to(el, {
              scrollTrigger: { trigger: '#how-it-works', start: 'top 60%', end: 'bottom 60%', scrub: 0.8 },
              strokeDashoffset: 0,
              delay: i * 0.15,
            });
          });

          // ── Proof section ───────────────────────────────────────────────
          gsap.from('.proof-card', {
            scrollTrigger: { trigger: '#proof', start: 'top 80%', end: 'top 25%', scrub: 0.45 },
            opacity: 0, y: 65, scale: 0.93, stagger: 0.08,
          });

          // ── CTA section ─────────────────────────────────────────────────
          gsap.from('.cta-content > *', {
            scrollTrigger: { trigger: '#cta', start: 'top 80%', end: 'top 38%', scrub: 0.5 },
            opacity: 0, y: 42, stagger: 0.09,
          });
          gsap.from('#cta-svg', {
            scrollTrigger: { trigger: '#cta', start: 'top 85%', end: 'top 30%', scrub: true },
            opacity: 0, scale: 0.75, rotate: 20,
            transformOrigin: 'center center',
          });
        },
      );
    })();
  }, []);

  return null;
}
