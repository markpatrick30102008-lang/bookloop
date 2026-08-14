import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { scoreQuiz } from "../lib/quiz"
import { BOOKS, coverUrl } from "../data/books"
import { LoopLogo } from "../components/LoopLogo"

export function QuizResult() {
  const navigate = useNavigate()
  const result = useMemo(() => {
    const name = localStorage.getItem("bookloop.name") || "Reader"
    const raw = localStorage.getItem("bookloop.quiz")
    let answers: string[][] = []
    try {
      answers = raw ? (JSON.parse(raw) as string[][]) : []
    } catch {
      answers = []
    }
    const arch = scoreQuiz(answers.length > 0 ? answers : [["cozy"]])
    const scored = BOOKS.map((b) => ({
      book: b,
      score: b.tags.reduce((s, t) => s + (arch.tags.includes(t) ? 1 : 0), 0),
    }))
      .sort((a, b) => b.score - a.score || b.book.year - a.book.year)
      .slice(0, 3)
    return { name, arch, scored }
  }, [])

  const { name, arch, scored } = result

  return (
    <div className="relative min-h-dvh overflow-hidden bg-forest text-paper">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-moss/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 130, damping: 12 }}
        >
          <LoopLogo size={56} tone="paper" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5 text-sm font-medium tracking-wide text-amber uppercase"
        >
          Your Book DNA result
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-display mt-2 text-center text-4xl leading-tight font-semibold"
        >
          {name}, you're{" "}
          <span className="text-amber">
            {arch.emoji} {arch.name}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-4 text-center text-base leading-relaxed text-paper/80"
        >
          {arch.blurb}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          {arch.traits.map((t) => (
            <span key={t} className="rounded-full border border-amber/40 bg-amber/10 px-4 py-1.5 text-sm font-medium text-amber">
              {t}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-8 w-full"
        >
          <h2 className="font-display text-lg font-semibold text-paper">
            Picked just for you
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {scored.map(({ book, score }) => (
              <div
                key={book.id}
                className="group relative overflow-hidden rounded-2xl bg-paper/10 p-2 transition hover:bg-paper/15"
              >
                <img
                  src={coverUrl(book.isbn)}
                  alt={book.title}
                  className="h-36 w-full rounded-xl object-cover shadow-lg"
                  loading="lazy"
                />
                <div className="mt-2 truncate px-1 text-xs font-medium text-paper/90">
                  {book.title}
                </div>
                <div className="flex items-center gap-1 px-1 pt-0.5">
                  <span className="rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-forest-deep">
                    {Math.min(99, 70 + score * 12)}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          onClick={() => navigate("/dna")}
          className="btn btn-primary mt-10 h-14 w-full rounded-full border-0 bg-amber text-base font-semibold text-forest-deep shadow-[0_10px_30px_rgba(244,163,64,0.35)] transition-transform hover:scale-[1.02] hover:bg-amber-deep active:scale-95"
        >
          Find my books ✨
        </motion.button>
        <p className="mt-4 text-center text-xs text-paper/40">
          We'll remember your Book DNA — no account needed yet.
        </p>
      </div>
    </div>
  )
}
