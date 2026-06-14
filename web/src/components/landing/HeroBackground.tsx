// Decorative background for the Hero section.
// Pure server component — no JS. GSAP in LandingAnimations.tsx targets ids here.
export default function HeroBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden
    >
      {/* Gradient orbs — parallax-scrolled by GSAP */}
      <div
        id="hero-orb-1"
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full animate-glow-pulse"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, rgba(109,40,217,0.22) 0%, transparent 65%)',
        }}
      />
      <div
        id="hero-orb-2"
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full animate-glow-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(147,51,234,0.14) 0%, transparent 65%)',
          animationDelay: '2s',
        }}
      />
      <div
        id="hero-orb-3"
        className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full animate-glow-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)',
          animationDelay: '3.5s',
        }}
      />

      {/* Stellar network graph */}
      <svg
        id="hero-network"
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="var(--primary)" strokeWidth="1" fill="none">
          <line x1="180" y1="140" x2="420" y2="280" />
          <line x1="420" y1="280" x2="680" y2="180" />
          <line x1="680" y1="180" x2="950" y2="330" />
          <line x1="950" y1="330" x2="1220" y2="220" />
          <line x1="280" y1="480" x2="580" y2="380" />
          <line x1="580" y1="380" x2="820" y2="530" />
          <line x1="820" y1="530" x2="1080" y2="440" />
          <line x1="420" y1="280" x2="580" y2="380" />
          <line x1="680" y1="180" x2="820" y2="530" />
          <line x1="80"  y1="680" x2="280" y2="480" />
          <line x1="1080" y1="440" x2="1320" y2="580" />
          <line x1="180" y1="140" x2="80"  y2="680" />
          <line x1="1220" y1="220" x2="1320" y2="580" />
          <line x1="950" y1="330" x2="1080" y2="440" />
          <line x1="50"  y1="400" x2="180" y2="140" />
          <line x1="1350" y1="300" x2="1220" y2="220" />
          <line x1="700" y1="750" x2="820" y2="530" />
          <line x1="700" y1="750" x2="580" y2="380" />
        </g>
        <g fill="var(--primary)">
          {(
            [
              [180, 140, 5], [420, 280, 4], [680, 180, 6], [950, 330, 4],
              [1220, 220, 5], [280, 480, 4], [580, 380, 5], [820, 530, 4],
              [1080, 440, 5], [80,  680, 4], [1320, 580, 4],
              [50,  400, 3], [1350, 300, 3], [700, 750, 3],
            ] as [number, number, number][]
          ).map(([x, y, r], i) => (
            <circle key={i} className="hero-node" cx={x} cy={y} r={r} />
          ))}
        </g>
      </svg>

      {/* Floating MuxPay orbit icons */}
      <div
        className="animate-float absolute top-[14%] right-[7%] opacity-[0.09] text-primary"
        style={{ animationDuration: '6s' }}
      >
        <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
          <path d="M7 22V10l4.5 6 4.5-6 4.5 6 4.5-6v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div
        className="animate-float-x absolute top-[58%] left-[4%] opacity-[0.07] text-accent"
        style={{ animationDuration: '10s' }}
      >
        <svg width="60" height="60" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
          <path d="M7 22V10l4.5 6 4.5-6 4.5 6 4.5-6v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div
        className="animate-float absolute bottom-[22%] right-[14%] opacity-[0.06] text-primary"
        style={{ animationDuration: '7s', animationDelay: '1s' }}
      >
        <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
          <path d="M7 22V10l4.5 6 4.5-6 4.5 6 4.5-6v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          opacity: 0.25,
        }}
      />

      {/* Bottom fade to page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--background))',
        }}
      />
    </div>
  );
}
