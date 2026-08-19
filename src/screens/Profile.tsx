import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { archFromStorage, isExplorer } from "../lib/matching"
import { BOOKS, coverUrl } from "../data/books"
import { conditionMeta } from "../lib/conditions"
import { CoverImg } from "../components/CoverImg"
import { loadMyListings } from "../lib/myListings"

const DEMO_REPUTATION = [
  { emoji: "⭐", value: "4.9", label: "Average rating" },
  { emoji: "🔁", value: "97", label: "Successful swaps" },
  { emoji: "⚡", value: "98%", label: "Response rate" },
  { emoji: "🎓", value: "Verified", label: "Student" },
  { emoji: "💬", value: "10 min", label: "Usually replies" },
  { emoji: "🚫", value: "0", label: "Cancellations" },
]

const NEW_REPUTATION = [
  { emoji: "⭐", value: "—", label: "Average rating" },
  { emoji: "🔁", value: "0", label: "Successful swaps" },
  { emoji: "⚡", value: "—", label: "Response rate" },
  { emoji: "🎓", value: "✓", label: "Student" },
  { emoji: "💬", value: "—", label: "Usually replies" },
  { emoji: "🚫", value: "0", label: "Cancellations" },
]

const SHELF = [
  { id: "favorites", label: "Your Chapter", emoji: "📚" },
  { id: "completed", label: "Completed", emoji: "📖" },
  { id: "listings", label: "My Listings", emoji: "🔁" },
] as const

type ShelfId = (typeof SHELF)[number]["id"]

export function Profile() {
  const navigate = useNavigate()
  const name = localStorage.getItem("bookloop.name") || "Reader"
  const city = localStorage.getItem("bookloop.city") || "Campus, Riverside"
  const joined = localStorage.getItem("bookloop.joined") || "Jun 2026"
  const isDemo = localStorage.getItem("bookloop.demo") === "1"
  const arch = archFromStorage()
  const [shelf, setShelf] = useState<ShelfId>("favorites")
  const reputation = isDemo ? DEMO_REPUTATION : NEW_REPUTATION
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const likes = useMemo(() => {
    try {
      return (JSON.parse(localStorage.getItem("bookloop.likes") || "[]") as string[])
        .map((id) => BOOKS.find((b) => b.id === id))
        .filter(Boolean) as (typeof BOOKS)[number][]
    } catch {
      return []
    }
  }, [])

  const completed = useMemo(() => {
    try {
      return (JSON.parse(localStorage.getItem("bookloop.completed") || "[]") as string[])
        .map((id) => BOOKS.find((b) => b.id === id))
        .filter(Boolean) as (typeof BOOKS)[number][]
    } catch {
      return []
    }
  }, [])

  const listings = useMemo(() => loadMyListings(), [])

  return (
    <div className="mx-auto w-full max-w-md px-6">
      <div className="relative -mx-6 overflow-hidden rounded-b-[2.5rem] bg-forest px-6 pt-6 pb-7 text-paper">
        <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-amber/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-moss/20 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber to-amber-deep font-display text-xl font-bold text-forest-deep shadow-lg">
              {initials}
            </div>
            <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-moss text-[11px] font-black text-forest-deep ring-2 ring-forest">
              ✓
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold">{name}</h1>
            <p className="mt-0.5 text-sm text-paper/70">
              {arch.emoji} {arch.name} · 📍 {city}
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex items-center justify-between rounded-2xl bg-paper/10 px-4 py-3 backdrop-blur-sm">
          <div>
            <p className="text-xs text-paper/60">Member since</p>
            <p className="text-sm font-bold text-paper">{joined}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-paper/60">Books sold</p>
            <p className="font-display text-lg font-bold text-amber">{isDemo ? "12" : "0"}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-paper/60">Books swapped</p>
            <p className="font-display text-lg font-bold text-amber">{isDemo ? "7" : "0"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-paper/60">Rating</p>
            <p className="font-display text-lg font-bold text-amber">{isDemo ? "4.9" : "—"}</p>
          </div>
        </div>
      </div>

      {isExplorer() && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-amber/40 bg-amber/10 p-4">
          <span className="text-3xl">🧬</span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-ink">Complete Your Book DNA</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
              Unlock more accurate recommendations by taking your personalized Book DNA Quiz.
            </p>
          </div>
          <button
            onClick={() => navigate("/quiz")}
            className="shrink-0 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper transition hover:bg-forest-light active:scale-95"
          >
            Take Quiz
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-2">
        {reputation.map((r) => (
          <div key={r.label} className="flex flex-col items-center rounded-2xl border border-mist bg-paper px-2 py-3 text-center shadow-sm">
            <span className="text-lg">{r.emoji}</span>
            <span className="font-display mt-1 text-base font-bold text-ink">{r.value}</span>
            <span className="text-[10px] font-medium tracking-wide text-ink-soft uppercase">{r.label}</span>
          </div>
        ))}
      </div>

      <div className="no-scrollbar -mx-6 mt-7 flex gap-2 overflow-x-auto px-6 pb-1">
        {SHELF.map((s) => (
          <button
            key={s.id}
            onClick={() => setShelf(s.id)}
            className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              shelf === s.id ? "bg-forest text-paper shadow-lg shadow-forest/30" : "bg-mist text-ink-soft hover:bg-paper-dim"
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={shelf} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-4">
          {shelf === "favorites" &&
            (likes.length === 0 ? (
              <EmptyShelf emoji="❤️" title="Your chapter starts empty" body="Swipe through your personal picks and the books you love will live here." cta="Start swiping" onCta={() => navigate("/swipe")} />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {likes.map((book) => (
                  <button key={book.id} onClick={() => navigate(`/book/${book.id}`)} className="group text-left">
                    <CoverImg
                      src={coverUrl(book.isbn)}
                      alt={book.title}
                      className="w-full rounded-xl shadow-md transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
                    />
                    <p className="mt-1.5 line-clamp-2 text-xs leading-tight font-medium text-ink">{book.title}</p>
                  </button>
                ))}
              </div>
            ))}

          {shelf === "completed" &&
            (completed.length === 0 ? (
              <EmptyShelf emoji="📖" title="No finished chapters yet" body="Books you finish will collect here — every ending starts someone else's beginning." cta="Find a book" onCta={() => navigate("/marketplace")} />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {completed.map((book) => (
                  <button key={book.id} onClick={() => navigate(`/book/${book.id}`)} className="group text-left">
                    <div className="relative">
                      <CoverImg
                        src={coverUrl(book.isbn)}
                        alt={book.title}
                        className="w-full rounded-xl shadow-md transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
                      />
                      <span className="absolute right-1.5 bottom-1.5 rounded-full bg-forest/90 px-2 py-0.5 text-[9px] font-bold text-amber">✓ Done</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-tight font-medium text-ink">{book.title}</p>
                  </button>
                ))}
              </div>
            ))}

          {shelf === "listings" &&
            (listings.length === 0 ? (
              <EmptyShelf emoji="🔁" title="No listings yet" body="Sell a book from your shelf — it gets a BookScore and a second life." cta="Sell a book" onCta={() => navigate("/sell")} />
            ) : (
              <div className="flex flex-col gap-2.5">
                {listings.map(({ book, listing, score }) => (
                  <button key={listing.id} onClick={() => navigate(`/book/${book.id}`)} className="flex items-center gap-3 rounded-2xl border border-mist bg-paper p-3 text-left shadow-sm transition hover:border-forest">
                    <CoverImg src={coverUrl(book.isbn)} alt={book.title} className="w-11 shrink-0 rounded-xl shadow" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-ink">{book.title}</p>
                      <p className="text-[11px] text-ink-soft">
                        {listing.swapOnly ? "Swap" : `₹${listing.price}`} · {conditionMeta(listing.condition).emoji} {conditionMeta(listing.condition).label} · 📍 {listing.location}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="rounded-full bg-forest px-2.5 py-1 text-[10px] font-bold text-amber">BookScore {score}</span>
                      <p className="mt-1 text-[10px] font-semibold text-moss">● Active</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function EmptyShelf({ emoji, title, body, cta, onCta }: { emoji: string; title: string; body: string; cta: string; onCta: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-center text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 150, damping: 14 }} className="text-5xl">
        {emoji}
      </motion.div>
      <h3 className="font-display mt-4 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-ink-soft">{body}</p>
      <button onClick={onCta} className="mt-6 rounded-full bg-forest px-8 py-3.5 font-semibold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.03] hover:bg-forest-light active:scale-95">
        {cta}
      </button>
    </div>
  )
}
