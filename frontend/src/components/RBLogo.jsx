/**
 * RideBuddy logomark — "RB" monogram inside a stylised wheel.
 * Props:
 *   size   — overall width/height in px (default 36)
 *   className — extra class names
 */
export default function RBLogo({ size = 36, className = "" }) {
  const r = 46;        // outer wheel radius (viewBox is 0 0 100 100)
  const cx = 50;
  const cy = 50;
  const spokeCount = 6;

  // Generate spoke lines from hub to rim
  const spokes = Array.from({ length: spokeCount }, (_, i) => {
    const angle = (i * Math.PI * 2) / spokeCount - Math.PI / 2;
    return {
      x1: cx + 10 * Math.cos(angle),
      y1: cy + 10 * Math.sin(angle),
      x2: cx + (r - 6) * Math.cos(angle),
      y2: cy + (r - 6) * Math.sin(angle),
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RideBuddy logo"
      role="img"
    >
      {/* Outer wheel rim */}
      <circle cx={cx} cy={cy} r={r} stroke="#4ade80" strokeWidth="5" />

      {/* Inner hub */}
      <circle cx={cx} cy={cy} r="10" fill="#4ade80" opacity="0.15" stroke="#4ade80" strokeWidth="2" />

      {/* Spokes */}
      {spokes.map((s, i) => (
        <line
          key={i}
          x1={s.x1} y1={s.y1}
          x2={s.x2} y2={s.y2}
          stroke="#4ade80"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}

      {/* RB text centred inside the wheel */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#4ade80"
        fontSize="26"
        fontWeight="800"
        fontFamily="'Inter', system-ui, -apple-system, sans-serif"
        letterSpacing="-1"
      >
        RB
      </text>
    </svg>
  );
}
