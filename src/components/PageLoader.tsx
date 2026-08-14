import { motion } from "framer-motion"
import { LoopLogo } from "./LoopLogo"

const MESSAGES = ["Turning pages…", "Finding hidden gems…", "Matching your taste…"]

export function PageLoader() {
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-paper">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-forest shadow-lg shadow-forest/30"
      >
        <LoopLogo size={34} tone="paper" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm font-semibold text-ink-soft"
      >
        {msg}
      </motion.p>
    </div>
  )
}
