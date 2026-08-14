export function LoopLogo({ size = 40, tone = "forest" }: { size?: number; tone?: "forest" | "paper" }) {
  const page = tone === "forest" ? "#faf7f2" : "#1b4332"
  const spine = tone === "forest" ? "#1b4332" : "#f4a340"
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="21"
        fill="none"
        stroke="#f4a340"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="66 66"
        strokeDashoffset="40"
      />
      <path d="M17 15c3-2.4 7-2.4 10 0v19c-3-2.4-7-2.4-10 0V15z" fill={page} />
      <path d="M31 15c-3-2.4-7-2.4-10 0v19c3-2.4 7-2.4 10 0V15z" fill={spine} />
    </svg>
  )
}
