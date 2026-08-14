import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { archFromStorage, buildCard, matchLabel, shortTitle, similarTo } from "../lib/matching"
import { ALL_BOOKS, coverUrl, type Book, type Listing } from "../data/books"
import { CONDITION_LEVELS, conditionMeta } from "../lib/conditions"
import { saveMyListing } from "../lib/myListings"
import { CoverImg } from "../components/CoverImg"

const GENRES = [...new Set(ALL_BOOKS.map((b) => b.genre))]
const LOCATIONS = ["Campus Library", "Hillview Ave", "Riverside Café", "Central Station", "Maple Street"]

const CONDITIONS = CONDITION_LEVELS

const AI_NOTES: Record<string, string[]> = {
  "Like new": ["Excellent condition", "Clean cover, no marks"],
  Good: ["Slight corner wear", "Light highlighting on a few pages"],
  Fair: ["Torn cover edge", "Name written inside"],
  "Well loved": ["Significant cover wear", "Heavy highlighting", "Spine creases"],
}

const TYPICAL: Record<string, { lo: number; hi: number; rec: number }> = {
  "Like new": { lo: 7, hi: 10, rec: 8 },
  Good: { lo: 5, hi: 8, rec: 6 },
  Fair: { lo: 4, hi: 6, rec: 5 },
  "Well loved": { lo: 2, hi: 4, rec: 3 },
}

const PHOTO_SLOTS = ["Front", "Back", "Inside Pages", "Notes", "Damage"]
const FIND_STEPS = ["Reading your book's data…", "Checking editions…", "Finding the cover…", "Done!"]

function digitsOf(isbn: string): string {
  return isbn.replace(/\D/g, "")
}

function toIsbn13(digits: string): string {
  if (digits.length !== 10) return digits
  let sum = 0
  for (let i = 0; i < 9; i++) sum += (i % 2 === 0 ? 1 : 3) * Number(digits[i])
  const check = (10 - (sum % 10)) % 10
  return `978${digits.slice(0, 9)}${check}`
}

function findByIsbn(isbn: string): Book | null {
  const d = digitsOf(isbn)
  const key13 = toIsbn13(d)
  return (
    ALL_BOOKS.find((b) => {
      const bd = digitsOf(b.isbn)
      return bd === d || bd === key13 || (d.length === 13 && bd === key13) || (bd.length === 13 && bd === key13)
    }) ?? null
  )
}

function bookScore(condition: string, photoCount: number, flexible: boolean, priceInRange: boolean): number {
  let s = condition === "Like new" ? 92 : condition === "Good" ? 86 : condition === "Fair" ? 80 : 74
  s += Math.min(8, photoCount * 2)
  if (flexible) s += 2
  if (priceInRange) s += 3
  return Math.min(99, Math.max(60, s))
}

type Phase = "start" | "finding" | "details" | "preview" | "success"

export function Sell() {
  const navigate = useNavigate()
  const arch = archFromStorage()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scanningRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)

  const [phase, setPhase] = useState<Phase>("start")
  const [book, setBook] = useState<Book | null>(null)
  const [findStep, setFindStep] = useState(0)

  const [query, setQuery] = useState("")
  const [isbnInput, setIsbnInput] = useState("")
  const [manual, setManual] = useState(false)
  const [mTitle, setMTitle] = useState("")
  const [mAuthor, setMAuthor] = useState("")
  const [mGenre, setMGenre] = useState(GENRES[0])
  const [mYear, setMYear] = useState("")

  const [condition, setCondition] = useState("Good")
  const [price, setPrice] = useState(6)
  const [swapMode, setSwapMode] = useState<"sell" | "swap" | "both">("sell")
  const [location, setLocation] = useState(LOCATIONS[0])
  const [photos, setPhotos] = useState<Record<string, string | null>>({ Front: null, Back: null, "Inside Pages": null, Notes: null, Damage: null })
  const [notes, setNotes] = useState<string[]>(AI_NOTES.Good)
  const [listed, setListed] = useState<{ book: Book; listing: Listing; score: number } | null>(null)

  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return ALL_BOOKS.filter((b) => [b.title, b.author, b.isbn, b.genre].join(" ").toLowerCase().includes(q))
  }, [query])

  const typical = TYPICAL[condition]
  const priceInRange = price >= typical.lo - 1 && price <= typical.hi + 1
  const photoCount = Object.values(photos).filter(Boolean).length
  const score = bookScore(condition, photoCount, swapMode !== "sell", priceInRange)
  const sellingTime =
    swapMode === "swap"
      ? { text: "Likely to swap today", stars: "★★★★★" }
      : price <= typical.rec
        ? { text: "Likely to sell in 1–2 days", stars: "★★★★☆" }
        : price <= typical.rec * 1.3
          ? { text: "Likely to sell in 3–5 days", stars: "★★★☆☆" }
          : { text: "Likely to sell in a week or two", stars: "★★☆☆☆" }

  useEffect(() => {
    if (phase === "finding") {
      const timers = FIND_STEPS.map((_, i) => setTimeout(() => setFindStep(i + 1), 620 * (i + 1)))
      const end = setTimeout(() => setPhase("details"), 620 * FIND_STEPS.length + 300)
      return () => {
        timers.forEach(clearTimeout)
        clearTimeout(end)
      }
    }
  }, [phase])

  useEffect(() => {
    setNotes(AI_NOTES[condition])
  }, [condition])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    scanningRef.current = false
  }, [])

  const runFinding = (b: Book) => {
    setBook(b)
    setFindStep(0)
    setPhase("finding")
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop())
    }
    videoRef.current = null
    setScanning(false)
  }

  const startScan = async () => {
    const Barcode: any = (window as any).BarcodeDetector
    if (!Barcode || !navigator.mediaDevices?.getUserMedia) {
      setScanMsg("Camera scanning isn't available here — type the ISBN instead.")
      setTimeout(() => setScanMsg(null), 4500)
      return
    }
    setScanMsg(null)
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      const video = document.createElement("video")
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      video.autoplay = true
      videoRef.current = video
      document.getElementById("scan-stage")?.replaceChildren(video)
      await video.play()
      const detector = new Barcode({ formats: ["ean_13", "ean_8", "isbn_13", "isbn_10", "code_39"] })
      timeoutRef.current = window.setTimeout(() => {
        scanningRef.current = false
        stopCamera()
        setScanMsg("Couldn't read a barcode — try typing the ISBN.")
      }, 15000)
      const loop = async () => {
        if (!scanningRef.current) return
        try {
          const codes = await detector.detect(video)
          if (codes.length > 0) {
            const found = findByIsbn(codes[0].rawValue ?? "")
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            scanningRef.current = false
            stopCamera()
            if (found) runFinding(found)
            else {
              setManual(true)
              setScanMsg("That ISBN isn't in our catalog — add the details and we'll list it anyway.")
              setTimeout(() => setScanMsg(null), 5000)
            }
            return
          }
        } catch {
          /* keep scanning */
        }
        requestAnimationFrame(loop)
      }
      scanningRef.current = true
      loop()
    } catch {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      scanningRef.current = false
      stopCamera()
      setScanMsg("Camera access was denied — type the ISBN instead.")
      setTimeout(() => setScanMsg(null), 4500)
    }
  }

  const submitIsbn = () => {
    const found = findByIsbn(isbnInput)
    if (found) {
      runFinding(found)
      setIsbnInput("")
    } else {
      setManual(true)
      setScanMsg("That ISBN isn't in our catalog — add the details and we'll list it anyway.")
      setTimeout(() => setScanMsg(null), 5000)
    }
  }

  const pickManual = () => {
    if (!mTitle.trim() || !mAuthor.trim()) return
    runFinding({
      id: `manual-${Date.now()}`,
      title: mTitle.trim(),
      author: mAuthor.trim(),
      isbn: digitsOf(isbnInput),
      genre: mGenre,
      year: mYear ? Number(mYear) : new Date().getFullYear(),
      tags: ["cozy"],
    })
  }

  const onSlotPhoto = (slot: string, file: File) => {
    setPhotos((p) => ({ ...p, [slot]: URL.createObjectURL(file) }))
  }

  const listBook = () => {
    if (!book) return
    const listing: Listing = {
      id: `my-${Date.now()}`,
      bookId: book.id,
      seller: "You",
      price: Math.round(price * 2) / 2,
      condition,
      location,
      match: 0,
      available: true,
      swapOnly: swapMode === "swap",
    }
    saveMyListing({ id: listing.id, book, listing, score, notes: notes.filter((n) => !n.startsWith("✓")) })
    setListed({ book, listing, score })
    setPhase("success")
  }

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-forest bg-forest text-paper shadow-md shadow-forest/20" : "border-mist bg-mist/50 text-ink-soft hover:bg-mist"
    }`

  const card = book
    ? buildCard(book, { id: "preview", bookId: book.id, seller: "You", price: Math.round(price * 2) / 2, condition, location, match: 0, available: true, swapOnly: swapMode === "swap" }, arch)
    : null

  return (
    <div className="mx-auto w-full max-w-md px-6 pb-28">
      <div className="pt-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Sell a <span className="text-amber-deep">Book</span>
        </h1>
        <p className="text-sm text-ink-soft">Give it a second life in under a minute.</p>
      </div>

      <AnimatePresence mode="wait">
        {phase === "success" && listed ? (
          <motion.div key="success" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 13, delay: 0.1 }}
              className="text-6xl"
            >
              📚
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-[10px] font-bold tracking-widest text-amber-deep uppercase"
            >
              Your book
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display mt-1 text-3xl leading-tight font-semibold text-ink"
            >
              has started its
              <br />
              <span className="text-amber-deep">next chapter.</span>
            </motion.h2>
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75, type: "spring", stiffness: 260, damping: 12 }} className="mt-4 text-3xl">
              ✨
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="mt-5 w-full rounded-2xl border border-mist bg-paper p-4 shadow-sm">
              <p className="text-sm font-semibold text-ink">Your book is now live in the Marketplace</p>
              <p className="mt-0.5 text-xs text-ink-soft">Nearby readers can find it, reserve it, and message you here.</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-amber">BookScore {listed.score}</span>
                <span className="text-xs text-ink-soft">
                  {sellingTime.text} <span className="text-amber">{sellingTime.stars}</span>
                </span>
              </div>
            </motion.div>
            <div className="mt-7 flex w-full flex-col gap-2.5">
              <button
                onClick={() => navigate("/marketplace")}
                className="w-full rounded-full bg-forest py-3.5 font-bold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.02] hover:bg-forest-light active:scale-95"
              >
                View it in the Marketplace
              </button>
              <button
                onClick={() => {
                  setListed(null)
                  setBook(null)
                  setPhase("start")
                  setQuery("")
                  setPhotos({ Front: null, Back: null, "Inside Pages": null, Notes: null, Damage: null })
                }}
                className="w-full rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50"
              >
                List another book
              </button>
            </div>
          </motion.div>
        ) : phase === "finding" ? (
          <motion.div key="finding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="mt-16 flex flex-col items-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="text-5xl">
              🔮
            </motion.div>
            <h2 className="font-display mt-5 text-xl font-semibold text-ink">Finding your book…</h2>
            <div className="mt-7 flex w-full flex-col gap-3.5">
              {FIND_STEPS.map((label, i) => (
                <div key={label} className={`flex items-center gap-3 transition-opacity ${i > findStep ? "opacity-30" : "opacity-100"}`}>
                  <span className={`w-6 text-center ${i === FIND_STEPS.length - 1 ? "text-xl" : "text-base"}`}>{i === FIND_STEPS.length - 1 ? "✨" : "🔍"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
                      {i <= findStep && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: i === findStep && i < FIND_STEPS.length - 1 ? "100%" : "100%" }}
                          transition={i === findStep && i < FIND_STEPS.length - 1 ? { duration: 0.55, ease: "easeInOut" } : { duration: 0 }}
                          className={`h-full rounded-full ${i === FIND_STEPS.length - 1 ? "bg-moss" : "bg-gradient-to-r from-amber to-amber-deep"}`}
                        />
                      )}
                    </div>
                  </div>
                  {i < findStep && <span className="text-moss">✓</span>}
                </div>
              ))}
            </div>
          </motion.div>
        ) : phase === "start" ? (
          <motion.div key="start" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <button
              onClick={startScan}
              className="flex w-full flex-col items-center gap-2 rounded-3xl bg-gradient-to-r from-forest-deep to-forest py-7 text-paper shadow-[0_18px_40px_rgba(18,43,33,0.35)] transition hover:scale-[1.02] active:scale-95"
            >
              <span className="text-4xl">📸</span>
              <span className="text-lg font-bold">Scan Barcode</span>
              <span className="text-xs text-paper/60">Point your camera at the ISBN — we do the rest</span>
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => document.getElementById("isbn-input")?.focus()}
                className="flex flex-col items-center gap-1.5 rounded-3xl border border-mist bg-paper py-5 shadow-sm transition hover:border-forest hover:shadow-md active:scale-95"
              >
                <span className="text-3xl">⌨️</span>
                <span className="text-sm font-bold text-ink">Enter ISBN</span>
              </button>
              <button
                onClick={() => document.getElementById("search-input")?.focus()}
                className="flex flex-col items-center gap-1.5 rounded-3xl border border-mist bg-paper py-5 shadow-sm transition hover:border-forest hover:shadow-md active:scale-95"
              >
                <span className="text-3xl">🔍</span>
                <span className="text-sm font-bold text-ink">Search Catalog</span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-full border border-mist bg-paper px-4 py-3 shadow-sm">
              <span className="text-base text-ink-soft">🔍</span>
              <input
                id="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or ISBN…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-sm font-bold text-ink-soft">
                  ✕
                </button>
              )}
            </div>

            {results.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2">
                {results.slice(0, 6).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => runFinding(b)}
                    className="flex items-center gap-3 rounded-xl border border-mist bg-paper p-2.5 text-left transition hover:border-forest hover:shadow-md"
                  >
                    <CoverImg src={coverUrl(b.isbn)} alt={b.title} className="h-16 w-11 shrink-0 rounded-lg object-cover shadow" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display line-clamp-1 text-sm font-semibold text-ink">{b.title}</p>
                      <p className="text-xs text-ink-soft">{b.author}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold text-ink-soft">{b.year}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2">
                <input
                  id="isbn-input"
                  value={isbnInput}
                  onChange={(e) => setIsbnInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitIsbn()}
                  placeholder="Type ISBN, e.g. 9780525559474"
                  inputMode="numeric"
                  className="flex-1 rounded-xl border border-mist bg-paper px-4 py-3 text-sm outline-none shadow-sm focus:border-forest"
                />
                <button
                  onClick={submitIsbn}
                  disabled={digitsOf(isbnInput).length < 8}
                  className="rounded-xl bg-forest px-5 py-3 text-sm font-bold text-paper transition enabled:hover:bg-forest-light disabled:opacity-40"
                >
                  Find
                </button>
              </div>
            )}

            <button onClick={() => setManual(!manual)} className="mt-5 text-xs font-semibold text-forest underline">
              Can't find your book? {manual ? "Hide" : "Enter it manually"}
            </button>

            {manual && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
                <div className="flex flex-col gap-2 rounded-2xl border border-mist bg-paper p-4">
                  <input
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="Book title *"
                    className="rounded-xl border border-mist bg-mist/40 px-4 py-2.5 text-sm outline-none focus:border-forest"
                  />
                  <input
                    value={mAuthor}
                    onChange={(e) => setMAuthor(e.target.value)}
                    placeholder="Author *"
                    className="rounded-xl border border-mist bg-mist/40 px-4 py-2.5 text-sm outline-none focus:border-forest"
                  />
                  <div className="flex gap-2">
                    <select
                      value={mGenre}
                      onChange={(e) => setMGenre(e.target.value)}
                      className="flex-1 rounded-xl border border-mist bg-mist/40 px-3 py-2.5 text-sm outline-none focus:border-forest"
                    >
                      {GENRES.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                    <input
                      value={mYear}
                      onChange={(e) => setMYear(e.target.value)}
                      placeholder="Year"
                      inputMode="numeric"
                      className="w-24 rounded-xl border border-mist bg-mist/40 px-3 py-2.5 text-sm outline-none focus:border-forest"
                    />
                  </div>
                  <button
                    onClick={pickManual}
                    disabled={!mTitle.trim() || !mAuthor.trim()}
                    className="mt-1 rounded-full bg-forest py-2.5 text-sm font-bold text-paper transition enabled:hover:bg-forest-light disabled:opacity-40"
                  >
                    Use these details
                  </button>
                </div>
              </motion.div>
            )}

            {scanMsg && <p className="mt-3 rounded-xl bg-amber/15 px-4 py-2.5 text-center text-xs font-semibold text-amber-deep">{scanMsg}</p>}
          </motion.div>
        ) : phase === "details" && book ? (
          <motion.div key="details" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex gap-4 rounded-2xl bg-gradient-to-r from-forest-deep to-forest p-4 text-paper shadow-[0_16px_36px_rgba(18,43,33,0.3)]"
            >
              <CoverImg src={coverUrl(book.isbn)} alt={book.title} className="h-36 w-24 shrink-0 rounded-xl object-cover shadow-xl ring-1 ring-paper/20" />
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-amber px-2.5 py-0.5 text-[10px] font-black text-forest-deep">
                  {manual ? "Added by you" : "Auto-filled ✓"}
                </span>
                <p className="font-display mt-1.5 line-clamp-2 text-lg leading-tight font-semibold">{book.title}</p>
                <p className="text-xs text-paper/70">{book.author}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[
                    `ISBN ${book.isbn || "—"}`,
                    `📖 ${book.genre}`,
                    `📅 ${book.year}`,
                    `🏷️ ${book.tags.length} style${book.tags.length === 1 ? "" : "s"}`,
                  ].map((t) => (
                    <span key={t} className="rounded-full bg-paper/10 px-2.5 py-1 text-[10px] font-medium text-paper/85">
                      {t}
                    </span>
                  ))}
                </div>
                <button onClick={() => setPhase("start")} className="mt-2.5 text-[11px] font-bold text-amber underline">
                  Not right? Change book
                </button>
              </div>
            </motion.div>

            <p className="mt-6 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Condition</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCondition(c.id)}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition ${
                    condition === c.id ? `border-forest bg-forest text-paper shadow-md shadow-forest/20 ring-2 ${c.ring}` : "border-mist bg-paper hover:border-forest/40"
                  }`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-sm font-bold">{c.label}</span>
                  <span className={`text-[11px] ${condition === c.id ? "text-paper/70" : "text-ink-soft"}`}>{c.sub}</span>
                </button>
              ))}
            </div>

            <p className="mt-6 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Price</p>
            <div className="mt-2 rounded-2xl border border-mist bg-paper p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-ink">
                  ${price.toFixed(price % 1 === 0 ? 0 : 1)}
                  <span className="ml-1 text-[10px] font-bold tracking-widest text-ink-soft uppercase">{swapMode === "swap" ? "swap only" : "selling price"}</span>
                </span>
                <span className="rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-bold text-amber-deep">
                  {priceInRange ? "Great price ✓" : "High for this condition"}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={0.5}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-3 w-full accent-amber"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
                <span>Typical selling price</span>
                <span className="font-semibold text-ink">
                  ${typical.lo}–{typical.hi}
                </span>
              </div>
              <button
                onClick={() => setPrice(typical.rec)}
                className="mt-2 rounded-full bg-forest px-4 py-1.5 text-[11px] font-bold text-paper transition hover:bg-forest-light"
              >
                Use recommended ${typical.rec}
              </button>
            </div>

            <p className="mt-6 text-[10px] font-bold tracking-widest text-ink-soft uppercase">How do you want to trade?</p>
            <div className="mt-2 flex gap-2">
              {(
                [
                  { id: "sell", label: "Sell Only", emoji: "💰" },
                  { id: "swap", label: "Swap Only", emoji: "🔁" },
                  { id: "both", label: "Sell or Swap", emoji: "🤝" },
                ] as const
              ).map((m) => (
                <button key={m.id} className={`flex-1 ${chip(swapMode === m.id)} flex flex-col items-center gap-0.5 py-2.5`} onClick={() => setSwapMode(m.id)}>
                  <span className="text-base">{m.emoji}</span>
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>

            <p className="mt-6 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Pickup spot</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <button key={l} className={chip(location === l)} onClick={() => setLocation(l)}>
                  📍 {l}
                </button>
              ))}
            </div>

            <p className="mt-6 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Photos <span className="normal-case">({photoCount}/5 · boosts BookScore)</span></p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {PHOTO_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => photoInputRef.current?.click()}
                  className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border p-1.5 transition ${
                    photos[slot] ? "border-moss bg-moss/10" : "border-dashed border-mist bg-paper hover:border-forest/50"
                  }`}
                >
                  {photos[slot] ? (
                    <>
                      <img src={photos[slot]!} alt={slot} className="absolute inset-0 h-full w-full rounded-xl object-cover" />
                      <span className="absolute right-1 bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-moss text-[9px] font-black text-forest-deep">✓</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">📷</span>
                      <span className="text-center text-[9px] leading-tight font-bold text-ink-soft">{slot}</span>
                    </>
                  )}
                </button>
              ))}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  const slot = PHOTO_SLOTS.find((s) => !photos[s]) ?? "Front"
                  onSlotPhoto(slot, f)
                }}
              />
            </div>

            <p className="mt-6 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Suggested for this condition</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {notes.map((n) => (
                <button key={n} className={chip(notes.includes(n))} onClick={() => setNotes(notes.includes(n) ? notes.filter((x) => x !== n) : [...notes, n])}>
                  {n}
                </button>
              ))}
            </div>

            <div className="mt-7 flex gap-2.5">
              <button
                onClick={() => setPhase("start")}
                className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50"
              >
                Back
              </button>
              <button
                onClick={() => setPhase("preview")}
                className="flex-[2] rounded-full bg-forest py-3.5 font-bold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.02] hover:bg-forest-light active:scale-95"
              >
                Review listing
              </button>
            </div>
          </motion.div>
        ) : phase === "preview" && book && card ? (
          <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <div className="overflow-hidden rounded-2xl border border-mist bg-paper shadow-sm">
              <div className="relative">
                <CoverImg src={coverUrl(book.isbn)} alt={book.title} className="h-44 w-full object-cover" />
                <span className="absolute top-2 left-2 rounded-full bg-amber px-2.5 py-1 text-[11px] font-black text-forest-deep shadow">
                  {card.match}% match
                </span>
                <span className="absolute right-2 bottom-2 rounded-lg bg-paper/95 px-2 py-0.5 text-[11px] font-black text-forest shadow">
                  {swapMode === "swap" ? "Swap" : `$${price.toFixed(price % 1 === 0 ? 0 : 1)}`}
                </span>
                <span className="absolute bottom-2 left-2 rounded-lg bg-forest-deep/90 px-2 py-0.5 text-[10px] font-bold text-amber shadow">
                  BookScore {score}
                </span>
              </div>
              <div className="p-3">
                <p className="font-display line-clamp-1 text-sm font-semibold text-ink">{book.title}</p>
                {similarTo(book) ? (
                  <p className="mt-0.5 text-[11px] text-moss">📚 Similar to {shortTitle(similarTo(book)!.title)}</p>
                ) : (
                  <p className="mt-0.5 text-[11px] text-ink-soft">{book.author}</p>
                )}
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-ink-soft">📍 {location}</span>
                  <span className={`text-[11px] font-semibold ${conditionMeta(condition).cls}`}>
                    {conditionMeta(condition).emoji} {conditionMeta(condition).label}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-mist/70 pt-2">
                  <span className="text-[10px] font-semibold text-forest">
                    ✓ Verified <span className="font-normal text-ink-soft">· Seller: You</span>
                  </span>
                  <span className="rounded-full bg-forest px-3 py-1 text-[11px] font-bold text-paper">{matchLabel(card.match)}</span>
                </div>
                {notes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {notes.map((n) => (
                      <span key={n} className="rounded-full bg-amber/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-deep">
                        🏷️ {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {photoCount > 0 && (
              <div className="mt-3 flex gap-2">
                {PHOTO_SLOTS.filter((s) => photos[s]).map((s) => (
                  <img key={s} src={photos[s]!} alt={s} className="h-16 w-14 rounded-lg object-cover shadow" />
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-mist bg-paper p-4 shadow-sm">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Estimated selling time</p>
                <p className="mt-0.5 text-sm font-bold text-ink">{sellingTime.text}</p>
              </div>
              <span className="text-lg tracking-tight text-amber">{sellingTime.stars}</span>
            </div>

            <div className="mt-6 flex gap-2.5">
              <button
                onClick={() => setPhase("details")}
                className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50"
              >
                Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={listBook}
                className="flex-[2] rounded-full bg-gradient-to-r from-amber to-amber-deep py-3.5 font-bold text-forest-deep shadow-[0_10px_24px_rgba(217,138,31,0.35)]"
              >
                📚 Start Its Next Chapter
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {scanning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 px-6">
          <div id="scan-stage" className="h-64 w-64 overflow-hidden rounded-2xl ring-4 ring-amber/60" />
          <p className="mt-5 max-w-xs text-center text-sm font-medium text-paper">
            Point your camera at the ISBN barcode on the back cover
          </p>
          <button
            onClick={() => {
              scanningRef.current = false
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              stopCamera()
            }}
            className="mt-6 rounded-full bg-paper px-6 py-2.5 text-sm font-bold text-ink"
          >
            Cancel scan
          </button>
        </div>
      )}
    </div>
  )
}
