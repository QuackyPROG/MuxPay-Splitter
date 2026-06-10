'use client';
import { useEffect, useRef } from 'react';

export default function LandingAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Lazy-import GSAP so it stays out of the server bundle
    void (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { useGSAP: _useGSAP } = await import('@gsap/react');

      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();

      mm.add(
        {
          // Full animations for users who haven't requested reduced motion
          notReduced: '(prefers-reduced-motion: no-preference)',
          // Reduced motion — everything static, no tweens
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { notReduced } = context.conditions as { notReduced: boolean; reduced: boolean };
          if (!notReduced) return;

          // Hero entrance
          gsap.from('#hero h1', {
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: 'power3.out',
          });
          gsap.from('#hero p', {
            opacity: 0,
            y: 30,
            duration: 0.9,
            delay: 0.2,
            ease: 'power3.out',
          });
          gsap.from('#hero a', {
            opacity: 0,
            y: 20,
            duration: 0.7,
            delay: 0.4,
            stagger: 0.1,
            ease: 'power3.out',
          });

          // Problem stats — scrubbed fade/translate on scroll
          gsap.from('.problem-stat', {
            scrollTrigger: {
              trigger: '#problem',
              start: 'top 80%',
              end: 'top 40%',
              scrub: 0.5,
            },
            opacity: 0,
            y: 40,
            stagger: 0.04,
          });

          // HowItWorks steps — staggered reveal
          gsap.from('.how-step', {
            scrollTrigger: {
              trigger: '#how-it-works',
              start: 'top 75%',
              end: 'top 35%',
              scrub: 0.6,
            },
            opacity: 0,
            x: -30,
            stagger: 0.08,
          });

          // SVG path draw animation
          const paths = ['#flow-path-top', '#flow-path-mid', '#flow-path-bot'];
          paths.forEach((selector, i) => {
            const el = document.querySelector<SVGPathElement>(selector);
            if (!el) return;
            const len = el.getTotalLength?.() ?? 200;
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
            gsap.to(el, {
              scrollTrigger: {
                trigger: '#how-it-works',
                start: 'top 60%',
                end: 'bottom 60%',
                scrub: 0.8,
              },
              strokeDashoffset: 0,
              delay: i * 0.15,
            });
          });

          // Proof cards — parallax
          gsap.from('.proof-card', {
            scrollTrigger: {
              trigger: '#proof',
              start: 'top 85%',
              end: 'top 30%',
              scrub: 0.4,
            },
            opacity: 0,
            y: 50,
            stagger: 0.06,
          });
        },
      );
    })();
  }, []);

  return null;
}
