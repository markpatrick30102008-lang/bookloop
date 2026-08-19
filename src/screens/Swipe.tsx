import { useMemo, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion"
import { archFromStorage, buildCard, genomeFromStorage, matchLabel, whyList, type SwipeCard } from "../lib/matching"
import { BOOKS, BOOK_MOODS, LISTINGS, MOODS, coverUrl, listingFor } from "../data/books"
import { conditionMeta } from "../lib/conditions"
import { CoverImg } from "../components/CoverImg"
import { MatchRing } from "../components/MatchRing"
import { BookDetails } from "./BookDetails"

const DECK_SIZE = 10

const BADGE_SLOTS = new Map<number, string>([
  [1, "✨ Hidden Gem"],
  [4, "🏆 Trending Among Readers Like You"],
  [7, "✨ Hidden Gem"],
])

function buildFullDeck(): SwipeCard[] {
  const genome = genomeFromStorage()
  const cards = BOOKS.map((book) => {
    const listing = LISTINGS.find((l) => l.bookId === book.id) ?? listingFor(book.id)
    return buildCard(book, listing, genome)
  })
    .sort((a, b) => b.match - a.match)
    .slice(0, DECK_SIZE)
  return cards.map((card, i) => {
    if (BADGE_SLOTS.has(i)) return { ...card, badge: BADGE_SLOTS.get(i) }
    return card
  })
}

function DeckCard({
  card,
  onLike,
  onSkip,
  onMore,
  dir,
}: {
  card: SwipeCard
  onLike: () => void
  onSkip: () => void
  onMore: () => void
  dir: "left" | "right"
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-12, 12])
  const coverRotate = useTransform(x, [-200, 200], [9, -9])
  const coverShift = useTransform(x, [-200, 200], [-7, 7])
  const likeOpacity = useTransform(x, [30, 110], [0, 1])
  const passOpacity = useTransform(x, [-110, -30], [1, 0])
  const upOpacity = useTransform(y, [-130, -50], [1, 0])
  const initials = card.listing.seller
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
  const whys = whyList(card.book, genomeFromStorage())
  const condition = conditionMeta(card.listing.condition)
  const arch = archFromStorage()
  const stars = "★★★★★"

  return (
    <motion.div
      layoutId={`card-${card.book.id}`}
      initial={{ scale: 0.94, y: 40, opacity: 0.3 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={
        dir === "right"
          ? { x: 600, rotate: 18, opacity: 0, transition: { duration: 0.32, ease: "easeIn" } }
          : { x: -600, rotate: -18, opacity: 0, transition: { duration: 0.32, ease: "easeIn" } }
      }
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      drag
      dragElastic={0.9}
      style={{ x, y, rotate }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110 || info.velocity.x > 700) onLike()
        else if (info.offset.x < -110 || info.velocity.x < -700) onSkip()
        else if (info.offset.y < -120 || info.velocity.y < -600) onMore()
      }}
      className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-3xl border border-paper/10 bg-gradient-to-b from-forest-deep to-forest p-5 text-paper shadow-[0_28px_70px_rgba(18,43,33,0.55)] active:cursor-grabbing"
    >
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-3xl">
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-9 left-4 rotate-[-12deg] rounded-2xl border-4 border-moss bg-forest-deep/85 px-4 py-2 text-lg font-black tracking-wide uppercase"
        >
          📚 Saved to
          <br />
          Your Chapter
        </motion.div>
        <motion.div
          style={{ opacity: passOpacity }}
          className="absolute top-9 right-4 rotate-[12deg] rounded-2xl border-4 border-error bg-forest-deep/85 px-4 py-2 text-lg font-black tracking-wide uppercase"
        >
          📖 Closed Book
        </motion.div>
        <motion.div
          style={{ opacity: upOpacity }}
          className="absolute top-6 left-1/2 -translate-x-1/2 rounded-2xl border-4 border-amber bg-forest-deep/90 px-4 py-1.5 text-lg font-black tracking-wide text-amber uppercase"
        >
          ✨ Tell me more
        </motion.div>
      </div>

      <div className="flex h-full flex-col items-center">
        {card.badge && (
          <motion.span
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.02, type: "spring", stiffness: 260, damping: 20 }}
            className="rounded-full bg-gradient-to-r from-amber to-amber-deep px-3.5 py-1 text-[11px] font-bold text-forest-deep shadow-md"
          >
            {card.badge}
          </motion.span>
        )}

        <div className="mt-3 flex w-full items-start justify-center gap-5">
          <motion.div
            initial={{ y: 34, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 200, damping: 19 }}
            style={{ rotate: coverRotate, x: coverShift }}
            whileHover={{ y: -6 }}
            className="relative shrink-0"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-amber/25 blur-2xl" />
            <div className="relative">
              <CoverImg
                src={coverUrl(card.book.isbn)}
                alt={card.book.title}
                className="h-60 w-40 rounded-2xl object-cover shadow-[0_30px_60px_rgba(0,0,0,0.6)] ring-1 ring-paper/15"
              />
              <span className="absolute -right-2.5 -bottom-2.5 rounded-xl bg-amber px-2.5 py-1 text-sm font-black text-forest-deep shadow-lg">
                {card.listing.swapOnly ? "Swap" : `₹${card.listing.price}`}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="flex w-32 shrink-0 flex-col items-center pt-1.5"
          >
            <MatchRing value={card.match} size={84} label={matchLabel(card.match)} />
            <p className="mt-2 text-center text-[11px] leading-snug font-semibold text-amber/90">
              Because you're
              <br />
              {arch.emoji} {arch.name}
            </p>
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="font-display mt-4 line-clamp-1 px-2 text-center text-xl font-semibold"
        >
          {card.book.title}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27 }}
          className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
        >
          <span className="text-sm tracking-tight text-amber">{stars}</span>
          <span className="text-sm font-bold">{card.rating.toFixed(1)}</span>
          <span className="rounded-full bg-paper/10 px-2.5 py-0.5 text-[11px] font-medium text-paper/80">
            {card.book.genre}
          </span>
          <span className={`rounded-full bg-paper/10 px-2.5 py-0.5 text-[11px] font-semibold ${condition.cls}`}>
            {condition.emoji} {condition.label}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.31 }}
          className="mt-1.5 text-xs text-paper/55"
        >
          {card.book.author} · {card.book.year}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.37 }}
          className="mt-3.5 min-h-0 w-full flex-1 overflow-y-auto border-t border-paper/10 pt-3"
        >
          <p className="text-[10px] font-bold tracking-widest text-paper/50 uppercase">Why You'll Love This</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {whys.map((w) => (
              <p key={w.text} className="flex items-center gap-2 text-xs text-paper/85">
                <span className="text-sm">{w.emoji}</span> {w.text}
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.43 }}
          className="mt-auto w-full border-t border-paper/10 pt-3"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber to-amber-deep text-sm font-black text-forest-deep">
                {initials}
              </div>
              {card.verified && (
                <span className="absolute -right-1 -bottom-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-moss text-[10px] font-black text-forest-deep ring-2 ring-forest">
                  ✓
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] font-bold tracking-wide uppercase ${card.verified ? "text-moss" : "text-paper/50"}`}>
                {card.verified ? "Verified Seller" : "Nearby Reader"}
              </p>
              <p className="line-clamp-1 text-sm font-semibold">{card.listing.seller}</p>
              <p className="text-[10px] text-paper/50">🎉 {card.swaps} swaps done</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-semibold">📍{card.distance}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

type Fly = { id: string; isbn: string }

export function Swipe() {
  const fullDeck = useMemo(buildFullDeck, [])
  const [mood, setMood] = useState("all")
  const [queue, setQueue] = useState<SwipeCard[]>(fullDeck)
  const [dir, setDir] = useState<"left" | "right">("left")
  const [expanded, setExpanded] = useState<SwipeCard | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [fly, setFly] = useState<Fly | null>(null)
  const [likedCount, setLikedCount] = useState(0)
  const [total, setTotal] = useState(DECK_SIZE)

  const top = queue[0]
  const seen = total - queue.length

  const changeMood = (id: string) => {
    setMood(id)
    const filtered = id === "all" ? fullDeck : fullDeck.filter((c) => (BOOK_MOODS[c.book.id] ?? []).includes(id))
    setQueue(filtered)
    setTotal(filtered.length)
  }

  const advance = (d: "left" | "right") => {
    setDir(d)
    setQueue((q) => q.slice(1))
  }

  const like = () => {
    if (!top) return
    const likes: string[] = JSON.parse(localStorage.getItem("bookloop.likes") || "[]")
    if (!likes.includes(top.book.id)) {
      likes.push(top.book.id)
      localStorage.setItem("bookloop.likes", JSON.stringify(likes))
    }
    setLikedCount((n) => n + 1)
    setToast("Saved to Your Chapter")
    setTimeout(() => setToast(null), 1800)
    setFly({ id: `${top.book.id}-${Date.now()}`, isbn: top.book.isbn })
    advance("right")
  }

  const skip = () => {
    if (!top) return
    advance("left")
  }

  const reshuffle = () => {
    const genome = genomeFromStorage()
    const fresh = BOOKS.map((book) => {
      const listing = LISTINGS.find((l) => l.bookId === book.id) ?? listingFor(book.id)
      return buildCard(book, listing, genome)
    })
      .sort((a, b) => a.match - b.match)
      .slice(0, DECK_SIZE)
    const deck = fresh.map((card, i) => {
      if (BADGE_SLOTS.has(i)) return { ...card, badge: BADGE_SLOTS.get(i) }
      return card
    })
    setQueue(deck)
    setTotal(deck.length)
    setMood("all")
  }

  return (
    <div className="mx-auto w-full max-w-md px-6">
      <div className="flex items-center justify-between pt-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Book<span className="text-amber-deep">Swipe</span>
          </h1>
          <p className="text-sm text-ink-soft">Today's Discoveries</p>
        </div>
        <span className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-bold text-amber">
          {seen} / {total}
        </span>
      </div>

      <div className="no-scrollbar -mx-6 mt-4 flex snap-x gap-2 overflow-x-auto px-6 pb-1">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => changeMood(m.id)}
            className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              mood === m.id
                ? "bg-forest text-paper shadow-lg shadow-forest/30"
                : "bg-mist text-ink-soft hover:bg-paper-dim"
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {top ? (
        <>
          <div className="relative mx-auto mt-5 w-full max-w-sm" style={{ height: "clamp(460px, calc(100dvh - 320px), 630px)" }}>
            {queue.slice(1, 3).map((c, i) => (
              <motion.div
                key={c.book.id}
                initial={{ scale: 1 - (i + 1) * 0.04, y: (i + 1) * 14, opacity: 1 - (i + 1) * 0.3 }}
                animate={{ scale: 1 - (i + 1) * 0.04, y: (i + 1) * 14, opacity: 1 - (i + 1) * 0.3 }}
                className="absolute inset-0 overflow-hidden rounded-3xl border border-paper/10 bg-forest-deep"
              >
                <CoverImg
                  src={coverUrl(c.book.isbn)}
                  alt={c.book.title}
                  className="h-full w-full object-cover opacity-30 blur-[2px]"
                />
              </motion.div>
            ))}
            <AnimatePresence initial={false} custom={dir}>
              {top && (
                <DeckCard key={top.book.id} card={top} dir={dir} onLike={like} onSkip={skip} onMore={() => setExpanded(top)} />
              )}
            </AnimatePresence>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            {["⬅️ Skip", "⬆️ Tell Me More", "➡️ Save to Chapter"].map((g) => (
              <span
                key={g}
                className="rounded-full border border-mist bg-paper px-3 py-1.5 text-[11px] font-semibold text-ink-soft"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="mx-auto mt-4 flex max-w-sm items-stretch justify-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={skip}
              className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-mist text-sm font-bold text-ink-soft transition hover:bg-paper-dim"
            >
              ✕ Skip
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpanded(top)}
              className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-forest text-sm font-bold text-forest transition-colors hover:bg-forest hover:text-paper"
            >
              ✨ Tell Me More
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={like}
              className="flex h-12 flex-[1.35] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber to-amber-deep text-sm font-bold text-forest-deep shadow-[0_10px_24px_rgba(217,138,31,0.4)]"
            >
              📚 Save to Chapter
            </motion.button>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.9 }}
                className="fixed bottom-28 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-paper shadow-2xl"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="text-amber"
                >
                  📚
                </motion.span>
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {fly && (
              <motion.img
                key={fly.id}
                src={coverUrl(fly.isbn)}
                alt=""
                initial={{ position: "fixed", top: "44%", left: "50%", x: "-50%", y: "-50%", width: 130, rotate: 8, opacity: 1 }}
                animate={{ top: "12%", left: "90%", x: "-50%", y: "-50%", width: 54, rotate: 0, opacity: 0.85 }}
                transition={{ duration: 0.7, ease: "easeIn" }}
                onAnimationComplete={() => setFly(null)}
                className="z-50 rounded-lg shadow-2xl"
              />
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="flex min-h-[62dvh] flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 14 }}
            className="text-5xl"
          >
            🎉
          </motion.div>
          <h2 className="font-display mt-4 text-2xl font-semibold text-ink">You've reached the end of this chapter</h2>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            You discovered {likedCount} great {likedCount === 1 ? "book" : "books"} today. Want another chapter?
          </p>
          <button
            onClick={reshuffle}
            className="mt-6 rounded-full bg-forest px-8 py-3.5 font-semibold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.03] hover:bg-forest-light active:scale-95"
          >
            🔀 Shuffle Books
          </button>
        </div>
      )}

      <AnimatePresence>
        {expanded && <BookDetails card={expanded} onBack={() => setExpanded(null)} onSwitch={(next) => setExpanded(next)} />}
      </AnimatePresence>
    </div>
  )
}
