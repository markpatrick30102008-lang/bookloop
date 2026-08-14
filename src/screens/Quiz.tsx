import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { pickQuizQuestions } from "../lib/quiz"
import { setExplorerProfile } from "../lib/matching"

function ProgressRing({ step, total }: { step: number; total: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  const done = step / total
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="rotate-[-90deg]">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#2d6a4f" strokeWidth="5" />
      <motion.circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="#f4a340"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - done) }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 origin-center"
        fill="#faf7f2"
        fontSize="13"
        fontWeight="600"
      >
        {step}/{total}
      </text>
    </svg>
  )
}

export function Quiz() {
  const navigate = useNavigate()
  const [questions] = useState(() => pickQuizQuestions())
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<string[][]>([])
  const total = questions.length
  const q = questions[step]

  const choose = (i: number) => {
    setSelected(i)
    const next = [...answers, q.options[i].tags]
    setTimeout(() => {
      setAnswers(next)
      if (step + 1 < total) {
        setStep(step + 1)
        setSelected(null)
      } else {
        localStorage.removeItem("bookloop.profile")
        localStorage.setItem("bookloop.quiz", JSON.stringify(next))
        navigate("/result")
      }
    }, 260)
  }

  const back = () => {
    if (step === 0) {
      navigate("/")
      return
    }
    setAnswers(answers.slice(0, -1))
    setStep(step - 1)
    setSelected(null)
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-forest text-paper">
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-forest-light/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-amber/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-6 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={back}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/20 bg-paper/5 text-paper/80 transition hover:bg-paper/15"
              aria-label="Go back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => {
                setExplorerProfile()
                navigate("/home")
              }}
              className="flex items-center gap-1.5 rounded-full border-2 border-amber bg-amber/15 px-4 py-2 text-sm font-bold text-amber transition hover:scale-105 hover:bg-amber/25 active:scale-95"
            >
              Skip <span>→</span>
            </button>
          </div>
          <p className="font-display text-lg italic text-amber">Book DNA</p>
          <ProgressRing step={step + 1} total={total} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-1 flex-col justify-center"
          >
            <h1 className="font-display mt-10 text-3xl leading-snug font-semibold sm:text-4xl">
              {q.question}
            </h1>
            <p className="mt-2 text-sm text-paper/60">{q.sub}</p>

            <div className="mt-8 flex flex-col gap-3">
              {q.options.map((opt, i) => {
                const isSelected = selected === i
                return (
                  <motion.button
                    key={opt.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.3 }}
                    onClick={() => choose(i)}
                    className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "scale-[1.02] border-amber bg-amber/20"
                        : "border-paper/15 bg-paper/5 hover:border-amber/50 hover:bg-paper/10"
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-base font-medium text-paper">{opt.label}</span>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-amber text-forest-deep"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </motion.span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-xs text-paper/40">
          Question {step + 1} of {total} — there are no wrong answers
        </p>
      </div>
    </div>
  )
}
