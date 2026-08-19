import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { buildCard, genomeFromStorage } from "../lib/matching"
import { BOOKS, LISTINGS, coverUrl, listingFor } from "../data/books"
import { LoopLogo } from "../components/LoopLogo"

const STEPS = [
  { emoji: "🧬", label: "Analyzing your Book DNA…" },
  { emoji: "👥", label: "Finding readers like you…" },
  { emoji: "📚", label: "Building your bookshelf…" },
  { emoji: "✨", label: "Finding hidden gems…" },
]

export function BookDNA() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  const name = localStorage.getItem("bookloop.name") || "Reader"

  const { picks, count } = useMemo(() => {
    const genome = genomeFromStorage()
    const cards = BOOKS.map((book) => {
      const listing = LISTINGS.find((l) => l.bookId === book.id) ?? listingFor(book.id)
      return buildCard(book, listing, genome)
    }).sort((a, b) => b.match - a.match)
     const picks = cards.slice(0, 3)
     return { count: picks.length, picks }
  }, [])

  useEffect(() => {
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i + 1), 520 * (i + 1)))
    const end = setTimeout(() => setDone(true), 520 * STEPS.length + 300)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(end)
    }
  }, [])

  return (
    <div className="relative min-h-dvh overflow-hidden bg-forest text-paper">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-moss/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="analyzing"
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 130, damping: 12 }}
                className="flex justify-center"
              >
                <LoopLogo size={64} tone="paper" />
              </motion.div>

              <h1 className="font-display mt-6 text-center text-2xl font-semibold">
                Building your <span className="text-amber">Book DNA</span>
              </h1>

              <div className="mt-8 flex flex-col gap-4">
                {STEPS.map((s, i) => {
                  const state = step > i ? "done" : step === i ? "active" : "idle"
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: state === "idle" ? 0.35 : 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className="w-7 text-center text-lg">{s.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-paper/90">{s.label}</p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper/10">
                          {state !== "idle" && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: state === "done" ? "100%" : "100%" }}
                              transition={
                                state === "done"
                                  ? { duration: 0 }
                                  : { duration: 0.66, ease: "easeInOut" }
                              }
                              className={`h-full rounded-full ${
                                state === "done" ? "bg-moss" : "bg-gradient-to-r from-amber to-amber-deep"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                      {state === "done" && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-amber">✓</motion.span>}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className="flex w-full flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-amber text-4xl shadow-[0_0_50px_rgba(244,163,64,0.55)]"
              >
                ✨
              </motion.div>

              <h1 className="font-display mt-6 text-4xl leading-tight font-semibold">
                Welcome, <span className="text-amber">{name.split(" ")[0]}</span>.
              </h1>

              <p className="mt-3 text-lg">
                We've found <span className="font-black text-amber">{count} books</span> you're likely to love.
              </p>

              <div className="mt-7 flex items-end gap-3">
                {picks.map((c, i) => (
                  <motion.div
                    key={c.book.id}
                    initial={{ opacity: 0, y: 26, rotate: i === 0 ? -4 : 4 }}
                    animate={{ opacity: 1, y: 0, rotate: i === 0 ? -5 : 5 }}
                    transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 200, damping: 16 }}
                    className={i === 1 ? "relative z-10" : ""}
                  >
                    <div className="relative">
                      <img
                        src={coverUrl(c.book.isbn)}
                        alt={c.book.title}
                        className={`rounded-xl object-cover shadow-2xl ${
                          i === 1 ? "h-36 w-24 ring-2 ring-amber" : "h-28 w-19 opacity-80"
                        }`}
                      />
                      <span className="absolute -right-2 -bottom-2 rounded-lg bg-amber px-1.5 py-0.5 text-[10px] font-black text-forest-deep shadow">
                        {c.match}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                onClick={() => navigate("/home")}
                className="btn btn-primary mt-10 h-14 w-full rounded-full border-0 bg-amber text-base font-semibold text-forest-deep shadow-[0_10px_30px_rgba(244,163,64,0.35)] transition-transform hover:scale-[1.02] hover:bg-amber-deep active:scale-95"
              >
                Enter BookLoop
              </motion.button>
              <p className="mt-4 text-xs text-paper/40">
                Every book below is matched to your Book DNA.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
