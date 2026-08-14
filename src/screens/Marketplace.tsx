import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { archFromStorage, buildCard, shortTitle, similarTo, type SwipeCard } from "../lib/matching"
import { BOOKS, LISTINGS, coverUrl, listingFor } from "../data/books"
import { CONDITION_LEVELS, conditionMeta } from "../lib/conditions"
import { loadMyListings } from "../lib/myListings"
import { isReserved } from "../lib/reservations"

type TabId = "recommended" | "near" | "trending" | "deals" | "rescue"

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "recommended", label: "Recommended", emoji: "📖" },
  { id: "near", label: "Near You", emoji: "📍" },
  { id: "trending", label: "Trending", emoji: "🔥" },
  { id: "deals", label: "Best Deals", emoji: "💸" },
  { id: "rescue", label: "Rescue Books", emoji: "♻️" },
]

const GENRES = [...new Set(BOOKS.map((b) => b.genre))]
const CONDITIONS = CONDITION_LEVELS

const PRICE_BANDS: { id: string; label: string; test: (p: number) => boolean }[] = [
  { id: "under5", label: "Under $5", test: (p) => p < 5 },
  { id: "b5to8", label: "$5–8", test: (p) => p >= 5 && p <= 8 },
  { id: "over8", label: "$8+", test: (p) => p > 8 },
]

const DISTANCE_BANDS: { id: string; label: string; test: (d: number) => boolean }[] = [
  { id: "d1", label: "≤ 1 mi", test: (d) => d <= 1 },
  { id: "d2", label: "≤ 2 mi", test: (d) => d <= 2 },
  { id: "d3", label: "≤ 3 mi", test: (d) => d <= 3 },
]

const MATCH_BANDS: { id: string; label: string; test: (m: number) => boolean }[] = [
  { id: "m90", label: "90%+ match", test: (m) => m >= 90 },
  { id: "m75", label: "75%+ match", test: (m) => m >= 75 },
]

type Filters = {
  genre: string | null
  condition: string | null
  price: string | null
  distance: string | null
  matchMin: string | null
  swapOnly: boolean
}

const DEFAULT_FILTERS: Filters = { genre: null, condition: null, price: null, distance: null, matchMin: null, swapOnly: false }

function distOf(card: SwipeCard): number {
  return parseFloat(card.distance)
}

function priceOf(card: SwipeCard): number {
  return card.listing.swapOnly ? 0 : card.listing.price
}

function ListingCard({ card, rescue, reserved, onOpen }: { card: SwipeCard; rescue: boolean; reserved: boolean; onOpen: () => void }) {
  const similar = similarTo(card.book)
  const meta = conditionMeta(card.listing.condition)
  return (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-paper text-left shadow-sm transition-shadow hover:shadow-[0_18px_40px_rgba(18,43,33,0.18)] ${
        rescue ? "ring-2 ring-amber" : "border border-mist"
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={coverUrl(card.book.isbn)}
          alt={card.book.title}
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 rounded-full bg-amber px-2.5 py-1 text-[11px] font-black text-forest-deep shadow-md transition-shadow duration-300 group-hover:shadow-[0_0_18px_rgba(244,163,64,0.6)]">
          {card.match}% match
        </span>
        {card.score !== undefined && (
          <span className="absolute bottom-2 left-2 rounded-lg bg-forest-deep/90 px-2 py-0.5 text-[10px] font-bold text-amber shadow">
            BookScore {card.score}
          </span>
        )}
        <span className="absolute right-2 bottom-2 rounded-lg bg-paper/95 px-2 py-0.5 text-[11px] font-black text-forest shadow">
          {card.listing.swapOnly ? "Swap" : `$${card.listing.price}`}
        </span>
        {rescue && (
          <span className="absolute top-2 right-2 rounded-full bg-forest-deep/90 px-2 py-0.5 text-[10px] font-bold text-amber">
            ♻️ Second life
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5">
        <p className="font-display line-clamp-1 text-sm font-semibold text-ink">{card.book.title}</p>
        {similar ? (
          <p className="mt-0.5 text-[11px] text-moss">📚 Similar to {shortTitle(similar.title)}</p>
        ) : (
          <p className="mt-0.5 text-[11px] text-ink-soft">{card.book.author}</p>
        )}
        <div className="mt-1.5 flex items-center justify-between gap-1">
          <span className="text-[11px] text-ink-soft">
            ⭐ {card.rating.toFixed(1)} · 📍{card.distance}
          </span>
          <span className={`text-[11px] font-semibold ${meta.cls}`}>
            {meta.emoji} {meta.label}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-1 border-t border-mist/70 pt-2">
          <span className="flex min-w-0 items-center gap-1 text-[11px]">
            {card.verified && <span className="shrink-0 font-semibold text-forest">✓ Verified</span>}
            <span className="truncate font-normal text-ink-soft">{card.listing.seller}</span>
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              reserved ? "bg-mist text-ink-soft" : "bg-forest text-paper transition group-hover:bg-amber group-hover:text-forest-deep"
            }`}
          >
            {reserved ? "⏳ Pending" : "View"}
          </span>
        </div>
      </div>
    </motion.button>
  )
}

export function Marketplace() {
  const navigate = useNavigate()
  const arch = archFromStorage()

  const deck = useMemo(() => {
    const catalog = BOOKS.map((book) => {
      const listing = LISTINGS.find((l) => l.bookId === book.id) ?? listingFor(book.id)
      return buildCard(book, listing, arch)
    })
    const mine = loadMyListings().map(({ book, listing, score }) => ({ ...buildCard(book, listing, arch), score, verified: true }))
    return [...mine, ...catalog]
  }, [arch])

  const [tab, setTab] = useState<TabId>("recommended")
  const [query, setQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }))

  const activeFilterCount = Object.values(filters).filter((v) => v !== null && v !== false).length

  const visible = useMemo(() => {
    let cards = [...deck]
    if (tab === "near") cards.sort((a, b) => distOf(a) - distOf(b))
    else if (tab === "trending") cards.sort((a, b) => b.viewers - a.viewers)
    else if (tab === "deals") cards.sort((a, b) => priceOf(a) - priceOf(b))
    else if (tab === "rescue") cards = cards.filter((c) => c.listing.condition === "Fair" || c.listing.condition === "Well loved")
    else cards.sort((a, b) => b.match - a.match)

    const q = query.trim().toLowerCase()
    if (q) {
      cards = cards.filter((c) =>
        [c.book.title, c.book.author, c.book.isbn, c.book.genre, c.listing.seller, c.listing.location]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    }
    if (filters.genre) cards = cards.filter((c) => c.book.genre === filters.genre)
    if (filters.condition) cards = cards.filter((c) => c.listing.condition === filters.condition)
    if (filters.price) {
      const band = PRICE_BANDS.find((b) => b.id === filters.price)
      if (band) cards = cards.filter((c) => band.test(priceOf(c)))
    }
    if (filters.distance) {
      const band = DISTANCE_BANDS.find((b) => b.id === filters.distance)
      if (band) cards = cards.filter((c) => band.test(distOf(c)))
    }
    if (filters.matchMin) {
      const band = MATCH_BANDS.find((b) => b.id === filters.matchMin)
      if (band) cards = cards.filter((c) => band.test(c.match))
    }
    if (filters.swapOnly) cards = cards.filter((c) => c.listing.swapOnly)
    return cards
  }, [deck, tab, query, filters])

  const tabMeta = TABS.find((t) => t.id === tab)!

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
      active ? "border-forest bg-forest text-paper" : "border-mist bg-mist/50 text-ink-soft hover:bg-mist"
    }`

  return (
    <div className="mx-auto w-full max-w-md px-6 pb-28">
      <div className="pt-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Market<span className="text-amber-deep">place</span>
        </h1>
        <p className="text-sm text-ink-soft">Every book, matched to you</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-forest-deep to-forest px-4 py-3.5 text-paper shadow-[0_14px_34px_rgba(18,43,33,0.35)]"
      >
        <div className="text-2xl">🎯</div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-amber uppercase">Picked just for you</p>
          <p className="text-sm font-semibold">
            Because you're {arch.emoji} {arch.name}
          </p>
        </div>
      </motion.div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-mist bg-paper px-4 py-3 shadow-sm">
        <span className="text-base text-ink-soft">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, ISBN or genre…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-sm font-bold text-ink-soft">
            ✕
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              tab === t.id ? "bg-forest text-paper shadow-lg shadow-forest/30" : "bg-mist text-ink-soft hover:bg-paper-dim"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "rescue" && (
          <motion.div
            key="rescue-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 rounded-2xl border border-amber/50 bg-amber/10 px-4 py-3">
              <span className="text-lg">♻️</span>
              <p className="text-sm font-semibold text-amber-deep">
                Give this book a second life.
                <span className="mt-0.5 block text-xs font-normal text-ink-soft">
                  Well-loved copies, priced to move on to their next reader.
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex items-center gap-1.5 rounded-full border border-mist bg-paper px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-mist/40"
        >
          ⚙️ Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber text-[11px] font-black text-forest-deep">
              {activeFilterCount}
            </span>
          )}
        </button>
        <p className="text-xs text-ink-soft">
          {visible.length} {visible.length === 1 ? "book" : "books"} · {tabMeta.emoji} {tabMeta.label}
        </p>
      </div>

      {visible.length > 0 ? (
        <motion.div layout className="mt-3 grid grid-cols-2 gap-3">
          {visible.map((card) => (
            <ListingCard
              key={card.listing.id}
              card={card}
              rescue={tab === "rescue"}
              reserved={isReserved(card.book.id)}
              onOpen={() => navigate(`/book/${card.book.id}`)}
            />
          ))}
        </motion.div>
      ) : (
        <div className="mt-14 flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl">
            🔍
          </motion.div>
          <h2 className="font-display mt-4 text-xl font-semibold text-ink">No matching books found</h2>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Try a different search or clear your filters — your perfect match might be one tap away.
          </p>
          <button
            onClick={() => {
              setQuery("")
              setFilters(DEFAULT_FILTERS)
            }}
            className="mt-5 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-paper transition hover:scale-[1.03] active:scale-95"
          >
            Clear search & filters
          </button>
        </div>
      )}

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-paper p-6 pb-8 shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-mist" />
              <h2 className="font-display text-lg font-semibold text-ink">Filters</h2>

              <p className="mt-4 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Genre</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className={chip(!filters.genre)} onClick={() => setFilter("genre", null)}>
                  Any
                </button>
                {GENRES.map((g) => (
                  <button key={g} className={chip(filters.genre === g)} onClick={() => setFilter("genre", filters.genre === g ? null : g)}>
                    {g}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Condition</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className={chip(!filters.condition)} onClick={() => setFilter("condition", null)}>
                  Any
                </button>
                {CONDITIONS.map((c) => (
                  <button key={c.id} className={chip(filters.condition === c.id)} onClick={() => setFilter("condition", filters.condition === c.id ? null : c.id)}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Price</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className={chip(!filters.price)} onClick={() => setFilter("price", null)}>
                  Any
                </button>
                {PRICE_BANDS.map((b) => (
                  <button key={b.id} className={chip(filters.price === b.id)} onClick={() => setFilter("price", filters.price === b.id ? null : b.id)}>
                    {b.label}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Distance</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className={chip(!filters.distance)} onClick={() => setFilter("distance", null)}>
                  Any
                </button>
                {DISTANCE_BANDS.map((b) => (
                  <button key={b.id} className={chip(filters.distance === b.id)} onClick={() => setFilter("distance", filters.distance === b.id ? null : b.id)}>
                    {b.label}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Match %</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className={chip(!filters.matchMin)} onClick={() => setFilter("matchMin", null)}>
                  Any
                </button>
                {MATCH_BANDS.map((b) => (
                  <button key={b.id} className={chip(filters.matchMin === b.id)} onClick={() => setFilter("matchMin", filters.matchMin === b.id ? null : b.id)}>
                    {b.label}
                  </button>
                ))}
              </div>

              <label className="mt-4 flex items-center justify-between rounded-xl border border-mist bg-mist/40 px-4 py-3">
                <span className="text-sm font-semibold text-ink">Swap-only books only</span>
                <button
                  onClick={() => setFilter("swapOnly", !filters.swapOnly)}
                  className={`relative h-6 w-11 rounded-full transition ${filters.swapOnly ? "bg-forest" : "bg-mist"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-all ${filters.swapOnly ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
              </label>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="h-12 flex-1 rounded-full border border-mist text-sm font-semibold text-ink-soft transition hover:bg-mist/50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="h-14 flex-[2] rounded-full bg-forest text-sm font-bold text-paper shadow-lg shadow-forest/30 transition hover:bg-forest-light active:scale-95"
                >
                  Show {visible.length} {visible.length === 1 ? "book" : "books"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate("/sell")}
        className="fixed right-5 bottom-24 z-40 flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-amber to-amber-deep px-5 font-bold text-forest-deep shadow-[0_12px_30px_rgba(217,138,31,0.45)]"
      >
        <span className="text-xl leading-none">＋</span> Sell Your Book
      </motion.button>
    </div>
  )
}
