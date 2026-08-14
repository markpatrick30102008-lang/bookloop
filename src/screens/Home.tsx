import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { LoopLogo } from "../components/LoopLogo"
import { CoverImg } from "../components/CoverImg"
import { MatchRing } from "../components/MatchRing"
import { AboutModal } from "../components/AboutModal"
import { archFromStorage } from "../lib/matching"
import { BOOKS, LISTINGS, coverUrl } from "../data/books"

const TRENDING_IDS = ["b4", "b13", "b7", "b5", "b9", "b3", "b10"]

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: "easeOut" as const },
})

export function Home() {
  const navigate = useNavigate()
  const [aboutOpen, setAboutOpen] = useState(false)

  const data = useMemo(() => {
    const name = localStorage.getItem("bookloop.name") || "Reader"
    const arch = archFromStorage()
    const scored = BOOKS.map((b) => ({
      book: b,
      score: b.tags.reduce((s, t) => s + (arch.tags.includes(t) ? 1 : 0), 0),
      match: Math.min(99, 62 + b.tags.reduce((s, t) => s + (arch.tags.includes(t) ? 1 : 0), 0) * 14),
    })).sort((a, b) => b.score - a.score || b.book.year - b.book.year)

    const bestListing = LISTINGS.filter((l) => l.available).sort((a, b) => b.match - a.match)[0]
    const bestBook = scored.find((s) => s.book.id === bestListing?.bookId) ?? scored[0]
    const trending = TRENDING_IDS.map((id) => scored.find((s) => s.book.id === id)).filter(Boolean) as typeof scored
    const nearby = LISTINGS.filter((l) => l.available)
      .sort((a, b) => b.match - a.match)
      .slice(0, 3)
    return { name, arch, bestListing, bestBook, trending, nearby }
  }, [])

  const { name, arch, bestListing, bestBook, trending, nearby } = data
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-b-[2.5rem] bg-forest pb-10 text-paper">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-moss/20 blur-3xl" />

        <div className="relative px-6 pt-6">
          <motion.div {...fadeUp(0)} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LoopLogo size={30} tone="paper" />
              <span className="font-display text-lg font-semibold tracking-tight">BookLoop</span>
            </div>
            <button
              onClick={() => setAboutOpen(true)}
              className="mr-2 flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 bg-paper/10 text-paper transition hover:bg-paper/20 active:scale-95"
              aria-label="About BookLoop"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber text-sm font-bold text-forest-deep shadow-md transition hover:scale-105 active:scale-95"
            >
              {initials}
            </button>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="mt-8">
            <h1 className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
              {greeting}, {name} <span className="inline-block">👋</span>
            </h1>
            <p className="mt-2 text-paper/70">Ready for your next great read?</p>
          </motion.div>

          <motion.div {...fadeUp(0.18)} className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-paper/15 bg-paper/10 px-3.5 py-1.5 text-sm font-medium">
              {arch.emoji} {arch.name}
            </span>
            {arch.traits.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full border border-amber/30 bg-amber/10 px-3.5 py-1.5 text-sm text-amber">
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="px-6">
        <motion.div
          {...fadeUp(0.26)}
          onClick={() => navigate(`/book/${bestBook.book.id}`)}
          className="relative -mt-4 cursor-pointer overflow-hidden rounded-3xl border border-mist bg-paper p-5 shadow-[0_18px_40px_rgba(46,42,36,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(46,42,36,0.22)]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-3 py-1 text-xs font-bold tracking-wide text-amber-deep uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            Today's best match
          </span>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative shrink-0">
              <CoverImg
                src={coverUrl(bestBook.book.isbn)}
                alt={bestBook.book.title}
                className="h-40 w-27 rounded-xl object-cover shadow-[0_12px_24px_rgba(46,42,36,0.35)]"
              />
              <div className="absolute -top-2 -left-2 rotate-[-6deg] rounded-lg bg-forest px-2 py-1 text-[10px] font-bold text-amber shadow">
                {bestBook.book.genre}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display line-clamp-2 text-xl leading-snug font-semibold text-ink">
                {bestBook.book.title}
              </h2>
              <p className="mt-1 truncate text-sm text-ink-soft">{bestBook.book.author}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {bestListing && (
                  <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                    ${bestListing.price}
                  </span>
                )}
                {bestListing && (
                  <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink-soft">
                    {bestListing.condition}
                  </span>
                )}
                {bestListing && (
                  <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink-soft">
                    {bestListing.location}
                  </span>
                )}
              </div>
            </div>
            <MatchRing value={bestBook.match} />
          </div>
        </motion.div>

        <motion.button
          {...fadeUp(0.34)}
          onClick={() => navigate("/swipe")}
          className="group relative mt-6 flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-amber to-amber-deep text-lg font-bold text-forest-deep shadow-[0_14px_34px_rgba(217,138,31,0.45)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_18px_44px_rgba(217,138,31,0.55)] active:scale-95"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
          Start Swiping
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </motion.button>
        <p className="mt-2 text-center text-xs text-ink-soft">
          Like what you see, skip the rest — your matches improve as you swipe
        </p>

        <motion.section {...fadeUp(0.42)} className="mt-9">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Trending this week</h2>
            <button onClick={() => navigate("/swipe")} className="text-sm font-semibold text-forest hover:underline">
              Swipe all
            </button>
          </div>
          <div className="no-scrollbar -mx-6 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2">
            {trending.map(({ book, match }) => (
              <motion.button
                key={book.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(`/book/${book.id}`)}
                className="w-32 shrink-0 snap-start text-left"
              >
                <div className="relative">
                  <CoverImg
                    src={coverUrl(book.isbn)}
                    alt={book.title}
                    className="h-44 w-32 rounded-2xl object-cover shadow-[0_10px_22px_rgba(46,42,36,0.28)] transition-shadow duration-300 hover:shadow-[0_16px_30px_rgba(46,42,36,0.35)]"
                  />
                  <span className="absolute right-2 bottom-2 rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-amber shadow">
                    {match}% match
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-tight font-medium text-ink">{book.title}</p>
                <p className="mt-0.5 truncate text-xs text-ink-soft">{book.author}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeUp(0.5)} className="mt-9">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Nearby on BookLoop</h2>
            <button onClick={() => navigate("/marketplace")} className="text-sm font-semibold text-forest hover:underline">
              View all
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {nearby.map((l) => {
              const book = BOOKS.find((b) => b.id === l.bookId)!
              return (
                <motion.button
                  key={l.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/book/${l.bookId}`)}
                  className="flex items-center gap-4 rounded-2xl border border-mist bg-paper p-3 text-left shadow-sm transition-shadow hover:shadow-[0_10px_24px_rgba(46,42,36,0.12)]"
                >
                  <CoverImg
                    src={coverUrl(book.isbn)}
                    alt={book.title}
                    className="h-20 w-14 shrink-0 rounded-lg object-cover shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-semibold text-ink">{book.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-soft">{book.author}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest">
                        ${l.price}
                      </span>
                      <span className="rounded-full bg-mist px-2 py-0.5 text-xs text-ink-soft">
                        {l.location}
                      </span>
                      <span className="rounded-full bg-mist px-2 py-0.5 text-xs text-ink-soft">
                        {l.seller}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-display text-lg font-bold text-amber-deep">{l.match}%</span>
                    <p className="text-[10px] tracking-wide text-ink-soft uppercase">match</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.section>
      </div>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
