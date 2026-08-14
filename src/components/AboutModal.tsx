import { AnimatePresence, motion } from "framer-motion"
import { LoopLogo } from "./LoopLogo"

export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed inset-0 z-[70] flex items-center justify-center px-8"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-xs flex-col items-center rounded-3xl bg-paper p-8 text-center shadow-2xl"
            >
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}>
                <LoopLogo size={56} />
              </motion.div>
              <h2 className="font-display mt-4 text-2xl font-semibold text-ink">BookLoop</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Making every book
                <br />
                find its next reader.
              </p>
              <div className="mt-5 flex flex-col gap-1.5">
                <span className="rounded-full bg-forest px-4 py-1 text-xs font-bold text-amber">Version 1.0 · Release Candidate</span>
                <span className="rounded-full bg-mist px-4 py-1 text-xs font-semibold text-ink-soft">Young Founders Challenge</span>
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-full bg-forest py-3 text-sm font-bold text-paper transition hover:bg-forest-light active:scale-95"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
