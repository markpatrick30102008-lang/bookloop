import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { buildCard, archFromStorage, matchLabel, whyYoullLoveIt, type SwipeCard } from "../lib/matching"
import { BOOKS, LISTINGS, SYNOPSES, coverUrl, listingFor } from "../data/books"
import { conditionMeta } from "../lib/conditions"
import { CoverImg } from "../components/CoverImg"
import { MatchRing } from "../components/MatchRing"
import { addReservationChat } from "../lib/chats"
import { isReserved, markReserved } from "../lib/reservations"

const PROCESS_STEPS = ["Confirming pickup details…", "Notifying the seller…", "Opening your message thread…"]

function Stars({ value }: { value: number }) {
  const pct = (value / 5) * 100
  return (
    <div className="relative inline-block text-sm leading-none tracking-tight">
      <span className="text-mist">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-amber" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </div>
  )
}

export function BookDetails({
  card,
  onBack,
  onSwitch,
}: {
  card: SwipeCard
  onBack: () => void
  onSwitch?: (next: SwipeCard) => void
}) {
  const [phase, setPhase] = useState<"idle" | "confirm" | "processing" | "sent">("idle")
  const [processIdx, setProcessIdx] = useState(0)
  const [chatId, setChatId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { book, listing, match, distance, rating, verified } = card
  const reserved = isReserved(book.id)

  useEffect(() => {
    if (phase !== "processing") return
    const timers = PROCESS_STEPS.map((_, i) => setTimeout(() => setProcessIdx(i + 1), 480 * (i + 1)))
    const end = setTimeout(() => {
      markReserved(book.id)
      setChatId(addReservationChat(listing.seller, book.title, book.isbn, verified))
      setPhase("sent")
    }, 480 * PROCESS_STEPS.length + 250)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(end)
    }
  }, [phase, listing.seller, book.title, book.isbn])

  const similar = useMemo(
    () =>
      BOOKS.filter((b) => b.id !== book.id && b.tags.some((t) => book.tags.includes(t))).slice(0, 6),
    [book]
  )

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [book.id])

  const initials = listing.seller
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")

  return (
    <motion.div
      layoutId={`card-${book.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-paper"
    >
      <div ref={scrollRef} className="h-full overflow-y-auto pb-10">
        <div className="relative overflow-hidden rounded-b-[2.5rem] bg-forest pb-24 pt-5 text-paper">
          <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-amber/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-moss/20 blur-3xl" />

          <div className="relative mx-auto w-full max-w-md px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/20 bg-paper/10 text-paper transition hover:bg-paper/20 active:scale-95"
                aria-label="Back to swiping"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-sm font-medium text-paper/70">Book details</span>
              <span className="w-11" />
            </div>

            <div className="mt-10 flex items-start justify-center gap-6">
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                className="relative shrink-0"
              >
                <CoverImg
                  src={coverUrl(book.isbn)}
                  alt={book.title}
                  className="h-64 w-44 rounded-2xl object-cover shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
                />
                <div className="absolute -top-3 -right-3 rotate-6 rounded-xl bg-amber px-2.5 py-1 text-xs font-bold text-forest-deep shadow-lg">
                  {listing.swapOnly ? "Swap only" : `$${listing.price}`}
                </div>
              </motion.div>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 140, damping: 14 }}
                className="mt-14 shrink-0 rounded-2xl bg-paper/10 p-2 backdrop-blur-sm"
              >
                <MatchRing value={match} size={86} label={matchLabel(match)} />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="font-display mt-8 text-center text-3xl leading-tight font-semibold"
            >
              {book.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="mt-1.5 text-center text-paper/70"
            >
              {book.author} · {book.genre} · {book.year}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              {book.tags.map((t) => (
                <span key={t} className="rounded-full border border-amber/30 bg-amber/10 px-3.5 py-1 text-sm text-amber">
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-6 rounded-3xl border border-amber/30 bg-amber/10 p-5"
          >
            <p className="text-xs font-bold tracking-wide text-amber-deep uppercase">Why You'll Love It</p>
            <ul className="mt-3 space-y-2">
              {whyYoullLoveIt(book).map((w) => (
                <li key={w} className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] font-black text-amber">
                    ✓
                  </span>
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <h2 className="font-display text-lg font-semibold text-ink">About this book</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">
              {SYNOPSES[book.id] ?? "A story readers keep coming back to."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-6 flex items-center gap-4 rounded-3xl border border-mist bg-paper p-4 shadow-sm"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest font-display text-lg font-bold text-amber">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                {listing.seller}
                {verified && (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-forest" title="Verified seller">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f4a340" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <Stars value={rating} />
                <span className="text-xs font-medium text-ink-soft">{rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-forest">{distance}</p>
              <p className="text-[10px] tracking-wide text-ink-soft uppercase">from you</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex gap-2"
          >
            <span className="rounded-full bg-forest px-4 py-1.5 text-sm font-bold text-amber">
              {listing.swapOnly ? "Swap — no cash" : `$${listing.price}`}
            </span>
            <span className="rounded-full bg-mist px-4 py-1.5 text-sm font-medium text-ink-soft">
              {conditionMeta(listing.condition).emoji} {conditionMeta(listing.condition).label}
            </span>
            <span className="rounded-full bg-mist px-4 py-1.5 text-sm font-medium text-ink-soft">
              Pickup: {listing.location}
            </span>
            {reserved && (
              <span className="rounded-full bg-amber/15 px-4 py-1.5 text-sm font-bold text-amber-deep">
                ⏳ Pending pickup
              </span>
            )}
          </motion.div>

          {similar.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="mt-8"
            >
              <h2 className="font-display text-lg font-semibold text-ink">If you love this, try</h2>
              <div className="no-scrollbar -mx-6 mt-3 flex snap-x gap-4 overflow-x-auto px-6 pb-2">
                {similar.map((b) => {
                  const simMatch = Math.min(99, match + (b.tags.filter((t) => book.tags.includes(t)).length ? 3 : 0))
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        const listing = LISTINGS.find((l) => l.bookId === b.id) ?? listingFor(b.id)
                        onSwitch?.(buildCard(b, listing, archFromStorage()))
                      }}
                      className="w-28 shrink-0 snap-start text-left"
                    >
                      <div className="relative">
                        <CoverImg
                          src={coverUrl(b.isbn)}
                          alt={b.title}
                          className="h-40 w-28 rounded-xl object-cover shadow-md"
                        />
                        <span className="absolute right-1.5 bottom-1.5 rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-amber">
                          {simMatch}% match
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-tight font-medium text-ink">{b.title}</p>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {listing.seller === "You" ? (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              disabled
              className="mt-8 flex h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-mist text-base font-bold text-ink-soft"
            >
              This is your listing
            </motion.button>
          ) : reserved ? (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              disabled
              className="mt-8 flex h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-mist text-base font-bold text-ink-soft"
            >
              ⏳ Reservation pending
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => setPhase("confirm")}
              className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber to-amber-deep text-base font-bold text-forest-deep shadow-[0_14px_34px_rgba(217,138,31,0.45)] transition-all hover:scale-[1.02] active:scale-95"
            >
              Reserve This Book
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </motion.button>
          )}
          <button
            onClick={onBack}
            className="mt-3 w-full rounded-full py-3 text-sm font-semibold text-ink-soft transition hover:text-ink"
          >
            Back
          </button>
        </div>
      </div>

      <AnimatePresence>
        {phase === "confirm" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center"
            onClick={() => setPhase("idle")}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-paper p-6 shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-start gap-4">
                <CoverImg
                  src={coverUrl(book.isbn)}
                  alt={book.title}
                  className="h-24 w-16 shrink-0 rounded-lg object-cover shadow-md"
                />
                <div className="min-w-0">
                  <h3 className="font-display text-lg leading-snug font-semibold text-ink">{book.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {listing.swapOnly ? "Swap reservation" : `${listing.seller} · $${listing.price}`}
                  </p>
                  <p className="mt-2 rounded-xl bg-mist px-3 py-2 text-xs leading-relaxed text-ink-soft">
                    We'll notify <b>{listing.seller}</b> of your request. A message thread opens right here so you can arrange pickup — no personal details are shared.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setPhase("idle")}
                  className="flex-1 rounded-full border-2 border-mist py-3 text-sm font-semibold text-ink-soft transition hover:border-ink-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setPhase("processing")}
                  className="flex-1 rounded-full bg-forest py-3 text-sm font-semibold text-paper shadow-lg shadow-forest/30 transition hover:bg-forest-light active:scale-95"
                >
                  Reserve it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {phase === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="w-full max-w-md rounded-t-3xl bg-paper p-6 shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-center gap-4">
                <CoverImg
                  src={coverUrl(book.isbn)}
                  alt={book.title}
                  className="h-20 w-13 shrink-0 rounded-lg object-cover shadow-md"
                />
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-amber-deep uppercase">Reserving</p>
                  <h3 className="font-display line-clamp-1 text-lg font-semibold text-ink">{book.title}</h3>
                  <p className="text-sm text-ink-soft">{listing.seller}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {PROCESS_STEPS.map((label, i) => (
                  <div key={label} className={`flex items-center gap-3 transition-opacity ${i > processIdx ? "opacity-30" : "opacity-100"}`}>
                    <span className="w-5 text-center text-sm">{i < processIdx ? "✅" : "⏳"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{label}</p>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-mist">
                        {i <= processIdx && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={i === processIdx && i < PROCESS_STEPS.length - 1 ? { duration: 0.6, ease: "easeInOut" } : { duration: 0 }}
                            className={`h-full rounded-full ${i === PROCESS_STEPS.length - 1 ? "bg-moss" : "bg-gradient-to-r from-amber to-amber-deep"}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {phase === "sent" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-deep/70 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="w-full max-w-sm rounded-3xl bg-paper p-8 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 12 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
              <h3 className="font-display mt-4 text-2xl font-semibold text-ink">Reserved!</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                The seller has been notified. When they reply, it shows up right here in your inbox.
              </p>
              <button
                onClick={() => chatId && navigate(`/messages?chat=${chatId}`)}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-amber to-amber-deep py-3.5 font-semibold text-forest-deep shadow-lg shadow-amber/30 transition hover:scale-[1.02] active:scale-95"
              >
                💬 Message {listing.seller.split(" ")[0]}
              </button>
              <button
                onClick={() => {
                  setPhase("idle")
                  onBack()
                }}
                className="mt-3 w-full rounded-full py-3 text-sm font-semibold text-ink-soft transition hover:text-ink"
              >
                Back
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
