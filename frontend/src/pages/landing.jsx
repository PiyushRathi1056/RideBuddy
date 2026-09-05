import { useEffect } from "react";
import { Link } from "react-router-dom";
import carPhoto from "../assets/alghozy-QCGtkO5_i-U-unsplash.jpg";
import RBLogo from "../components/RBLogo";

export default function Landing() {
  useEffect(() => { document.title = "RideBuddy — Share the Ride"; }, []);

  return (
    <div className="landing-root">

      {/* ── Header ── */}
      <header className="landing-header">
        <span className="landing-brand">
          <RBLogo size={32} />
          RIDEBUDDY
        </span>
        <nav className="landing-nav">
          <Link to="/login" className="landing-nav-link">Sign In</Link>
          <Link to="/signup" className="landing-btn-signup">Get Started</Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main className="landing-hero">

        {/* Left — graphic / copy panel */}
        <div className="landing-copy-panel">

          {/* SVG cityscape road illustration */}
          <svg
            className="landing-city-svg"
            viewBox="0 0 520 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Sky gradient */}
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f0f0f" />
                <stop offset="100%" stopColor="#1a2a1a" />
              </linearGradient>
              <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1e1e" />
                <stop offset="100%" stopColor="#111" />
              </linearGradient>
            </defs>
            <rect width="520" height="260" fill="url(#sky)" />

            {/* Buildings — back row */}
            <rect x="10"  y="80"  width="40" height="140" fill="#1c2b1c" rx="2"/>
            <rect x="55"  y="55"  width="30" height="165" fill="#162316" rx="2"/>
            <rect x="90"  y="95"  width="50" height="125" fill="#1c2b1c" rx="2"/>
            <rect x="145" y="60"  width="35" height="160" fill="#162316" rx="2"/>
            <rect x="185" y="100" width="45" height="120" fill="#1c2b1c" rx="2"/>
            <rect x="235" y="50"  width="28" height="170" fill="#162316" rx="2"/>
            <rect x="268" y="85"  width="55" height="135" fill="#1c2b1c" rx="2"/>
            <rect x="328" y="65"  width="38" height="155" fill="#162316" rx="2"/>
            <rect x="370" y="90"  width="48" height="130" fill="#1c2b1c" rx="2"/>
            <rect x="422" y="55"  width="32" height="165" fill="#162316" rx="2"/>
            <rect x="458" y="80"  width="55" height="140" fill="#1c2b1c" rx="2"/>

            {/* Building windows */}
            {[20,28,36,65,73,98,108,118,155,163,195,205,215,245,278,288,298,308,338,348,380,390,432,440,468,478,488].map((x, i) => (
              <rect key={i} x={x} y={90 + (i % 4) * 18} width="7" height="9"
                fill={i % 3 === 0 ? "#4ade80" : i % 5 === 0 ? "#a3f0c0" : "#2a3f2a"} opacity="0.7" rx="1"/>
            ))}

            {/* Ground */}
            <rect x="0" y="220" width="520" height="40" fill="#111" />

            {/* Road */}
            <rect x="0" y="215" width="520" height="45" fill="url(#road)" />

            {/* Road centre dashes */}
            {[0,1,2,3,4,5,6,7,8,9].map(i => (
              <rect key={i} x={i * 56 + 8} y="235" width="32" height="5" fill="#4ade80" opacity="0.35" rx="2"/>
            ))}

            {/* Green glow on road */}
            <rect x="0" y="214" width="520" height="3" fill="#4ade80" opacity="0.18" />

            {/* Moon */}
            <circle cx="470" cy="35" r="18" fill="#1e3a1e" />
            <circle cx="480" cy="28" r="14" fill="#0f0f0f" />

            {/* Stars */}
            {[[30,20],[80,12],[160,30],[300,15],[380,22],[50,42],[420,10],[200,8]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="1.2" fill="#4ade80" opacity={0.4 + (i % 3) * 0.2}/>
            ))}
          </svg>

          {/* Punchline copy */}
          <div className="landing-copy">
            <p className="landing-eyebrow">Every seat counts</p>
            <h1 className="landing-headline">
              Your city,<br />shared smarter.
            </h1>
            <p className="landing-sub">
              Find people heading your way. Split the ride, not the experience.
            </p>
            <div className="landing-cta-row">
              <Link to="/login" className="landing-cta-primary">Sign in</Link>
              <Link to="/signup"  className="landing-cta-ghost">Register now</Link>
            </div>
          </div>
        </div>

        {/* Right — photo panel */}
        <div className="landing-photo-panel">
          <img
            src={carPhoto}
            alt="Friends laughing and enjoying a shared car ride"
            className="landing-photo"
          />
          <div className="landing-photo-overlay landing-photo-overlay--right" />
          <div className="landing-photo-tint" />
        </div>

      </main>
    </div>
  );
}
