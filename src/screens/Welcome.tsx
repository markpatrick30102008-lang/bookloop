import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { LoopLogo } from "../components/LoopLogo"
import { seedDemoData } from "../lib/demo"
import { setExplorerProfile } from "../lib/matching"

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: "easeOut" as const },
})

export function Welcome() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [skipModal, setSkipModal] = useState(false)

  const storedName = localStorage.getItem("bookloop.name") || "Reader"
  const hasQuiz = !!localStorage.getItem("bookloop.quiz")
  const isExplorerReturning = !hasQuiz && localStorage.getItem("bookloop.profile") === "explorer"
  const isReturning = hasQuiz || isExplorerReturning
  const firstName = storedName.split(" ")[0]

  const start = () => {
    localStorage.setItem("bookloop.name", name.trim() || "Reader")
    navigate("/quiz")
  }

  const explore = () => {
    localStorage.setItem("bookloop.name", name.trim() || "Reader")
    setExplorerProfile()
    navigate("/home")
  }

  const demo = () => {
    seedDemoData()
    navigate("/dna")
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-forest text-paper">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-moss/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-forest-light/30 blur-3xl" />

      <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10">
        {!isReturning && (
          <button
            onClick={() => {
              localStorage.setItem("bookloop.name", name.trim() || "Reader")
              setExplorerProfile()
              navigate("/home")
            }}
            className="absolute top-6 left-6 flex items-center gap-1.5 rounded-full border-2 border-amber bg-amber/15 px-4 py-2 text-sm font-bold text-amber backdrop-blur-sm transition hover:scale-105 hover:bg-amber/25 active:scale-95"
          >
            Skip for now <span>→</span>
          </button>
        )}

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
          Every Book. A New Journey.
        </motion.p>

        {isReturning ? (
          <motion.div {...fadeUp(0.25)} className="mt-12 w-full max-w-sm">
            {hasQuiz ? (
              <>
                <h1 className="font-display text-center text-3xl leading-tight font-semibold sm:text-4xl">
                  Welcome back, {firstName} <span className="inline-block">👋</span>
                </h1>
                <p className="mt-2 text-center text-paper/70">Pick up where you left off.</p>

                <button
                  onClick={() => navigate("/home")}
                  className="btn btn-primary mt-8 h-14 w-full rounded-full border-0 bg-amber text-base font-semibold text-forest-deep shadow-[0_10px_30px_rgba(244,163,64,0.35)] transition-transform hover:scale-[1.02] hover:bg-amber-deep active:scale-95"
                >
                  Continue Reading
                </button>
                <button
                  onClick={() => navigate("/quiz")}
                  className="mt-3 h-12 w-full rounded-full border-2 border-paper/25 bg-transparent text-sm font-semibold text-paper/85 transition hover:border-amber hover:text-amber active:scale-95"
                >
                  🧬 Retake Book DNA
                </button>
                <button
                  onClick={() => navigate("/marketplace")}
                  className="mt-3 w-full text-center text-sm font-semibold text-paper/60 transition hover:text-amber"
                >
                  📚 Browse Marketplace
                </button>
              </>
            ) : (
              <>
                <h1 className="font-display text-center text-3xl leading-tight font-semibold sm:text-4xl">
                  Welcome back, {firstName} <span className="inline-block">👋</span>
                </h1>
                <p className="mt-2 text-center text-paper/70">Keep exploring — or personalize your picks.</p>

                <button
                  onClick={() => navigate("/home")}
                  className="btn btn-primary mt-8 h-14 w-full rounded-full border-0 bg-amber text-base font-semibold text-forest-deep shadow-[0_10px_30px_rgba(244,163,64,0.35)] transition-transform hover:scale-[1.02] hover:bg-amber-deep active:scale-95"
                >
                  🚀 Continue Exploring
                </button>
                <button
                  onClick={() => navigate("/quiz")}
                  className="mt-3 h-12 w-full rounded-full border-2 border-paper/25 bg-transparent text-sm font-semibold text-paper/85 transition hover:border-amber hover:text-amber active:scale-95"
                >
                  🧬 Take Book DNA Quiz
                </button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div {...fadeUp(0.25)} className="mt-10 w-full max-w-sm">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-paper/70">
              What's your name?
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

            <div className="my-6 h-px w-full bg-paper/15" />

            <button
              onClick={start}
              className="btn btn-primary h-14 w-full rounded-full border-0 bg-amber text-base font-semibold text-forest-deep shadow-[0_10px_30px_rgba(244,163,64,0.35)] transition-transform hover:scale-[1.02] hover:bg-amber-deep active:scale-95"
            >
              🧬 Discover My Book DNA
            </button>
            <p className="mt-2 text-center text-xs leading-relaxed text-paper/50">
              Answer 5 quick questions to unlock personalized book recommendations.
            </p>

            <button
              onClick={() => setSkipModal(true)}
              className="mt-4 h-12 w-full rounded-full border-2 border-amber/50 bg-transparent text-sm font-semibold text-amber transition hover:border-amber hover:bg-amber/10 active:scale-95"
            >
              🚀 Explore BookLoop
            </button>

            <div className="my-6 h-px w-full bg-paper/15" />

            <p className="text-center text-xs leading-relaxed text-paper/50">
              You can always personalize your recommendations later with the Book DNA Quiz.
            </p>
          </motion.div>
        )}

        {!isReturning && (
          <button onClick={demo} className="mt-10 text-xs font-medium text-paper/40 transition hover:text-amber">
            🎬 Developer demo
          </button>
        )}
      </div>

      <AnimatePresence>
        {skipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSkipModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-paper p-6 text-ink shadow-2xl"
            >
              <h2 className="font-display text-2xl font-semibold">Skip Book DNA?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                The Book DNA Quiz helps us recommend books you'll genuinely love. You can skip it for now and take it anytime from your Profile.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setSkipModal(false)
                    start()
                  }}
                  className="btn btn-primary h-12 w-full rounded-full border-0 bg-amber text-base font-semibold text-forest-deep shadow-[0_10px_30px_rgba(244,163,64,0.35)] transition-transform hover:scale-[1.02] hover:bg-amber-deep active:scale-95"
                >
                  📖 Take Quiz
                </button>
                <button
                  onClick={() => {
                    setSkipModal(false)
                    explore()
                  }}
                  className="h-12 w-full rounded-full border-2 border-ink/15 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest active:scale-95"
                >
                  🚀 Explore Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
