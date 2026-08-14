import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function MatchRing({
  value,
  size = 72,
  label,
}: {
  value: number
  size?: number
  label?: string
}) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const done = value / 100
  const [display, setDisplay] = useState(0)
  const [phase, setPhase] = useState<"calc" | "done">("calc")

  useEffect(() => {
    setDisplay(0)
    setPhase("calc")
    const duration = 1100
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(value * eased))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setPhase("done")
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute inset-1.5 rounded-full bg-amber blur-md"
        />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(250,247,242,0.15)" strokeWidth="6" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#f4a340"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - done) }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold" style={{ fontSize: size * 0.22 }}>
            {display}%
          </span>
          <span className="text-[10px] font-medium tracking-wide uppercase opacity-60">match</span>
        </div>
      </div>
      {label && (
        <p
          className="mt-1.5 text-center font-semibold text-amber"
          style={{ fontSize: Math.max(9, size * 0.13) }}
        >
          {phase === "calc" ? "Calculating your match…" : label}
        </p>
      )}
    </div>
  )
}
