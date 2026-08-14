import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { LoopLogo } from "../components/LoopLogo"
import { seedDemoData } from "../lib/demo"

export function Welcome() {
  const navigate = useNavigate()
  const [name, setName] = useState("")

  const start = () => {
    localStorage.setItem("bookloop.name", name.trim() || "Reader")
    navigate("/quiz")
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-forest text-paper">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-moss/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-forest-light/30 blur-3xl" />

      <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10">
        <button
          onClick={() => {
            localStorage.setItem("bookloop.name", name.trim() || "Reader")
            navigate("/home")
          }}
          className="absolute top-6 left-6 flex items-center gap-1.5 rounded-full border-2 border-amber bg-amber/15 px-4 py-2 text-sm font-bold text-amber backdrop-blur-sm transition hover:scale-105 hover:bg-amber/25 active:scale-95"
        >
          Skip for now <span>→</span>
        </button>

        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="mb-6 drop-shadow-[0_6px_24px_rgba(244,163,64,0.35)]"
        >
          <LoopLogo size={84} tone="paper" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-display text-lg italic text-amber"
        >
          buy · read · resell · repeat
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-display mt-3 text-center text-4xl leading-tight font-semibold text-paper sm:text-5xl"
        >
          Your next great read
          <br />
          is <span className="text-amber">already loved</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-4 max-w-sm text-center text-base leading-relaxed text-paper/80"
        >
          BookLoop learns your reading taste, then connects you with books people nearby
          are selling or swapping — so you read more and spend less.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-6 flex gap-2"
        >
          {["Discover", "Buy", "Swap"].map((w) => (
            <span key={w} className="rounded-full border border-amber/40 bg-amber/10 px-4 py-1.5 text-sm font-medium text-amber">
              {w}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-10 w-full max-w-sm"
        >
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-paper/70">
            What should we call you?
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && start()}
            placeholder="Your first name"
            maxLength={30}
            className="input w-full rounded-full border-0 bg-paper px-6 py-3.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-amber/40"
          />
          <button
            onClick={start}
            className="btn btn-primary mt-4 h-14 w-full rounded-full border-0 bg-amber text-base font-semibold text-forest-deep shadow-[0_10px_30px_rgba(244,163,64,0.35)] transition-transform hover:scale-[1.02] hover:bg-amber-deep active:scale-95"
          >
            Discover my Book DNA
          </button>
          <p className="mt-4 text-center text-xs text-paper/50">
            Takes ~30 seconds. No account needed yet.
          </p>
          <button
            onClick={() => {
              seedDemoData()
              navigate("/dna")
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-paper/25 py-3 text-sm font-semibold text-paper/85 backdrop-blur-sm transition hover:border-amber hover:text-amber active:scale-95"
          >
            🎬 Demo Mode — sample data in one tap
          </button>
        </motion.div>
      </div>
    </div>
  )
}
