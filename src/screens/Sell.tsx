import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ALL_BOOKS, coverUrl, type Book, type Listing } from "../data/books"
import { conditionMeta } from "../lib/conditions"
import { saveMyListing } from "../lib/myListings"
import { CoverImg } from "../components/CoverImg"
import { PHOTO_SLOTS, INSPECTION_STEPS, inspectBook, type PhotoSlot, type InspectionReport } from "../lib/bookInspectionService"
import { recommendPrice, evaluateCustomPrice, type PriceRecommendation } from "../lib/pricingEngine"
import { calculateEarnings, formatPrice, type DeliveryOption, type EarningsBreakdown } from "../lib/earningsCalculator"
import { DELIVERY_OPTIONS } from "../lib/deliveryService"
import { analyzeDemand, type DemandAnalysis } from "../lib/marketDemandService"
import { analyzeListing, type OptimizationResult } from "../lib/listingOptimizer"
import { generateInsights, type Insight } from "../lib/sellerInsights"
import { buildDashboard, type DashboardData } from "../lib/sellerDashboard"

const GENRES = [...new Set(ALL_BOOKS.map((b) => b.genre))]
const LOCATIONS = ["Campus Library", "Hillview Ave", "Riverside Café", "Central Station", "Maple Street"]

const FIND_STEPS = ["Reading your book's data…", "Checking editions…", "Finding the cover…", "Done!"]

type SellerPhase =
  | "start"
  | "finding"
  | "photos"
  | "inspecting"
  | "health"
  | "price"
  | "delivery"
  | "earnings"
  | "optimize"
  | "dashboard"
  | "success"

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

export function Sell() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scanningRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)

  const [phase, setPhase] = useState<SellerPhase>("start")
  const [book, setBook] = useState<Book | null>(null)
  const [findStep, setFindStep] = useState(0)
  const [inspectStep, setInspectStep] = useState(0)

  const [query, setQuery] = useState("")
  const [isbnInput, setIsbnInput] = useState("")
  const [manual, setManual] = useState(false)
  const [mTitle, setMTitle] = useState("")
  const [mAuthor, setMAuthor] = useState("")
  const [mGenre, setMGenre] = useState(GENRES[0])
  const [mYear, setMYear] = useState("")

  const [photos, setPhotos] = useState<Record<PhotoSlot, string | null>>({
    Front: null, Back: null, Spine: null, "Top Edge": null, "Bottom Edge": null, "Side Edge": null, "Inside Pages": null,
  })

  const [report, setReport] = useState<InspectionReport | null>(null)
  const [condition, setCondition] = useState("Good")

  const [priceRecommendation, setPriceRecommendation] = useState<PriceRecommendation | null>(null)
  const [price, setPrice] = useState(6)
  const [priceMode, setPriceMode] = useState<"suggested" | "custom">("suggested")
  const [customPriceInput, setCustomPriceInput] = useState("")

  const [delivery, setDelivery] = useState<DeliveryOption>("seller-ship")
  const [location, setLocation] = useState(LOCATIONS[0])
  const [swapMode, setSwapMode] = useState<"sell" | "swap" | "both">("sell")

  const [earnings, setEarnings] = useState<EarningsBreakdown | null>(null)
  const [priceFeedback, setPriceFeedback] = useState<{ label: "expensive" | "cheap" | "perfect"; message: string; extra?: string } | null>(null)
  const [demand, setDemand] = useState<DemandAnalysis | null>(null)
  const [insights, setInsights] = useState<Insight[]>([])

  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  const [listed, setListed] = useState<{ book: Book; listing: Listing; score: number } | null>(null)

  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return ALL_BOOKS.filter((b) => [b.title, b.author, b.isbn, b.genre].join(" ").toLowerCase().includes(q))
  }, [query])

  const photoCount = Object.values(photos).filter(Boolean).length
  const uploadedSlots = (Object.keys(photos) as PhotoSlot[]).filter((k) => photos[k] !== null)

  useEffect(() => {
    if (phase === "finding") {
      const timers = FIND_STEPS.map((_, i) => setTimeout(() => setFindStep(i + 1), 620 * (i + 1)))
      const end = setTimeout(() => setPhase("photos"), 620 * FIND_STEPS.length + 300)
      return () => { timers.forEach(clearTimeout); clearTimeout(end) }
    }
  }, [phase])

  useEffect(() => {
    if (phase === "inspecting") {
      const timers = INSPECTION_STEPS.map((_, i) => setTimeout(() => setInspectStep(i + 1), 700 * (i + 1)))
      const end = setTimeout(() => {
        if (book) {
          const r = inspectBook(book, photoCount, uploadedSlots)
          setReport(r)
          setCondition(r.condition)
          const dem = analyzeDemand(book)
          setDemand(dem)
          const rec = recommendPrice(book, r.overallScore, r.condition, 4.5)
          setPriceRecommendation(rec)
          setPrice(rec.recommended)
          setCustomPriceInput(rec.recommended.toString())
          const earn = calculateEarnings(rec.recommended, delivery)
          setEarnings(earn)
          setPriceFeedback(evaluateCustomPrice(rec.recommended, rec))
          const fb = evaluateCustomPrice(rec.recommended, rec)
          setInsights(generateInsights(r.overallScore, dem.level, fb.label, rec.expectedSaleDays, photoCount))
          setPhase("health")
        }
      }, 700 * INSPECTION_STEPS.length + 300)
      return () => { timers.forEach(clearTimeout); clearTimeout(end) }
    }
  }, [phase])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    scanningRef.current = false
  }, [])

  useEffect(() => {
    if (earnings && priceRecommendation) {
      const fb = evaluateCustomPrice(price, priceRecommendation)
      setPriceFeedback(fb)
      if (report && demand) {
        setInsights(generateInsights(report.overallScore, demand.level, fb.label, priceRecommendation.expectedSaleDays, photoCount))
      }
    }
  }, [price, delivery])

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
        } catch { /* keep scanning */ }
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
    if (found) { runFinding(found); setIsbnInput("") }
    else {
      setManual(true)
      setScanMsg("That ISBN isn't in our catalog — add the details and we'll list it anyway.")
      setTimeout(() => setScanMsg(null), 5000)
    }
  }

  const pickManual = () => {
    if (!mTitle.trim() || !mAuthor.trim()) return
    runFinding({
      id: `manual-${Date.now()}`, title: mTitle.trim(), author: mAuthor.trim(),
      isbn: digitsOf(isbnInput), genre: mGenre, year: mYear ? Number(mYear) : new Date().getFullYear(), tags: ["cozy"],
    })
  }

  const onSlotPhoto = (slot: PhotoSlot, file: File) => {
    setPhotos((p) => ({ ...p, [slot]: URL.createObjectURL(file) }))
  }

  const updateDelivery = (d: DeliveryOption) => {
    setDelivery(d)
    if (priceRecommendation) setEarnings(calculateEarnings(price, d))
  }

  const acceptSuggestedPrice = () => {
    if (priceRecommendation) {
      setPrice(priceRecommendation.recommended)
      setPriceMode("suggested")
    }
  }

  const enterCustomPrice = () => {
    setPriceMode("custom")
    setCustomPriceInput(price.toString())
  }

  const applyCustomPrice = () => {
    const v = parseFloat(customPriceInput)
    if (!isNaN(v) && v >= 1) {
      setPrice(Math.round(v * 2) / 2)
      if (priceRecommendation && report && demand) {
        setEarnings(calculateEarnings(Math.round(v * 2) / 2, delivery))
      }
    }
  }

  const runOptimize = () => {
    if (book && report && priceRecommendation) {
      const opt = analyzeListing(book, photoCount, uploadedSlots, price, condition, delivery)
      setOptimization(opt)
      setDashboard(buildDashboard(report, priceRecommendation, earnings!, demand!, opt))
    }
  }

  const listBook = () => {
    if (!book || !report) return
    const score = bookScore(condition, photoCount, swapMode !== "sell", true)
    const listing: Listing = {
      id: `my-${Date.now()}`, bookId: book.id, seller: "You",
      price: Math.round(price * 2) / 2, condition, location, match: 0, available: true, swapOnly: swapMode === "swap",
    }
    saveMyListing({ id: listing.id, book, listing, score, notes: [] })
    setListed({ book, listing, score })
    setPhase("success")
  }

  const resetAll = () => {
    setListed(null); setBook(null); setPhase("start"); setQuery(""); setReport(null)
    setPhotos({ Front: null, Back: null, Spine: null, "Top Edge": null, "Bottom Edge": null, "Side Edge": null, "Inside Pages": null })
    setPriceRecommendation(null); setEarnings(null); setDemand(null); setInsights([]); setOptimization(null); setDashboard(null)
  }

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-forest bg-forest text-paper shadow-md shadow-forest/20" : "border-mist bg-mist/50 text-ink-soft hover:bg-mist"}`

  const stepNum = (() => {
    const map: Record<SellerPhase, number> = {
      start: 1, finding: 1, photos: 2, inspecting: 3, health: 4,
      price: 5, delivery: 6, earnings: 7, optimize: 8, dashboard: 9, success: 10,
    }
    return map[phase]
  })()

  const totalSteps = 10
  const showProgress = !["start", "finding", "success"].includes(phase)

  return (
    <div className="mx-auto w-full max-w-md px-6 pb-28">
      <div className="pt-6">
        <p className="text-[10px] font-bold tracking-widest text-amber-deep uppercase">BookLoop Seller Studio</p>
        <h1 className="font-display mt-1 text-2xl font-semibold text-ink">
          {phase === "success" ? "Published!" : phase === "start" ? "Sell a Book" : `Step ${stepNum} of ${totalSteps}`}
        </h1>
        {showProgress && (
          <div className="mt-3 flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < stepNum ? "bg-forest" : i === stepNum - 1 ? "bg-amber" : "bg-mist"}`} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── SUCCESS ─── */}
        {phase === "success" && listed ? (
          <motion.div key="success" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-10 flex flex-col items-center text-center">
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 13, delay: 0.1 }} className="text-6xl">📚</motion.div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 text-[10px] font-bold tracking-widest text-amber-deep uppercase">Your book</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-display mt-1 text-3xl leading-tight font-semibold text-ink">
              has started its<br /><span className="text-amber-deep">next chapter.</span>
            </motion.h2>
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75, type: "spring", stiffness: 260, damping: 12 }} className="mt-4 text-3xl">✨</motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="mt-5 w-full rounded-2xl border border-mist bg-paper p-4 shadow-sm">
              <p className="text-sm font-semibold text-ink">Your book is now live in the Marketplace</p>
              <p className="mt-0.5 text-xs text-ink-soft">Nearby readers can find it, reserve it, and message you here.</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-amber">BookScore {listed.score}</span>
                {earnings && <span className="text-xs font-semibold text-forest">You earn {formatPrice(earnings.netEarnings)}</span>}
              </div>
            </motion.div>
            <div className="mt-7 flex w-full flex-col gap-2.5">
              <button onClick={() => navigate("/marketplace")} className="w-full rounded-full bg-forest py-3.5 font-bold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.02] hover:bg-forest-light active:scale-95">
                View it in the Marketplace
              </button>
              <button onClick={resetAll} className="w-full rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50">
                List another book
              </button>
            </div>
          </motion.div>

        /* ─── FINDING ─── */
        ) : phase === "finding" ? (
          <motion.div key="finding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="mt-16 flex flex-col items-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="text-5xl">🔮</motion.div>
            <h2 className="font-display mt-5 text-xl font-semibold text-ink">Finding your book…</h2>
            <div className="mt-7 flex w-full flex-col gap-3.5">
              {FIND_STEPS.map((label, i) => (
                <div key={label} className={`flex items-center gap-3 transition-opacity ${i > findStep ? "opacity-30" : "opacity-100"}`}>
                  <span className={`w-6 text-center ${i === FIND_STEPS.length - 1 ? "text-xl" : "text-base"}`}>{i === FIND_STEPS.length - 1 ? "✨" : "🔍"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
                      {i <= findStep && (
                        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={i === findStep && i < FIND_STEPS.length - 1 ? { duration: 0.55, ease: "easeInOut" } : { duration: 0 }}
                          className={`h-full rounded-full ${i === FIND_STEPS.length - 1 ? "bg-moss" : "bg-gradient-to-r from-amber to-amber-deep"}`} />
                      )}
                    </div>
                  </div>
                  {i < findStep && <span className="text-moss">✓</span>}
                </div>
              ))}
            </div>
          </motion.div>

        /* ─── INSPECTING ─── */
        ) : phase === "inspecting" ? (
          <motion.div key="inspecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="mt-16 flex flex-col items-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="text-5xl">🔬</motion.div>
            <h2 className="font-display mt-5 text-xl font-semibold text-ink">BookLoop Intelligence</h2>
            <p className="mt-1 text-sm text-ink-soft">is inspecting your book…</p>
            <div className="mt-7 flex w-full flex-col gap-3.5">
              {INSPECTION_STEPS.map((label, i) => (
                <div key={label} className={`flex items-center gap-3 transition-opacity ${i > inspectStep ? "opacity-30" : "opacity-100"}`}>
                  <span className="w-6 text-center text-base">{i === INSPECTION_STEPS.length - 1 ? "✨" : "🔍"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
                      {i <= inspectStep && (
                        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={i === inspectStep && i < INSPECTION_STEPS.length - 1 ? { duration: 0.6, ease: "easeInOut" } : { duration: 0 }}
                          className={`h-full rounded-full ${i === INSPECTION_STEPS.length - 1 ? "bg-moss" : "bg-gradient-to-r from-amber to-amber-deep"}`} />
                      )}
                    </div>
                  </div>
                  {i < inspectStep && <span className="text-moss">✓</span>}
                </div>
              ))}
            </div>
          </motion.div>

        /* ─── START ─── */
        ) : phase === "start" ? (
          <motion.div key="start" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <button onClick={startScan} className="flex w-full flex-col items-center gap-2 rounded-3xl bg-gradient-to-r from-forest-deep to-forest py-7 text-paper shadow-[0_18px_40px_rgba(18,43,33,0.35)] transition hover:scale-[1.02] active:scale-95">
              <span className="text-4xl">📸</span>
              <span className="text-lg font-bold">Scan Barcode</span>
              <span className="text-xs text-paper/60">Point your camera at the ISBN — we do the rest</span>
            </button>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => document.getElementById("isbn-input")?.focus()} className="flex flex-col items-center gap-1.5 rounded-3xl border border-mist bg-paper py-5 shadow-sm transition hover:border-forest hover:shadow-md active:scale-95">
                <span className="text-3xl">⌨️</span>
                <span className="text-sm font-bold text-ink">Enter ISBN</span>
              </button>
              <button onClick={() => document.getElementById("search-input")?.focus()} className="flex flex-col items-center gap-1.5 rounded-3xl border border-mist bg-paper py-5 shadow-sm transition hover:border-forest hover:shadow-md active:scale-95">
                <span className="text-3xl">🔍</span>
                <span className="text-sm font-bold text-ink">Search Catalog</span>
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-mist bg-paper px-4 py-3 shadow-sm">
              <span className="text-base text-ink-soft">🔍</span>
              <input id="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or ISBN…" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70" />
              {query && <button onClick={() => setQuery("")} className="text-sm font-bold text-ink-soft">✕</button>}
            </div>
            {results.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2">
                {results.slice(0, 6).map((b) => (
                  <button key={b.id} onClick={() => runFinding(b)} className="flex items-center gap-3 rounded-xl border border-mist bg-paper p-2.5 text-left transition hover:border-forest hover:shadow-md">
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
                <input id="isbn-input" value={isbnInput} onChange={(e) => setIsbnInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitIsbn()} placeholder="Type ISBN, e.g. 9780525559474" inputMode="numeric" className="flex-1 rounded-xl border border-mist bg-paper px-4 py-3 text-sm outline-none shadow-sm focus:border-forest" />
                <button onClick={submitIsbn} disabled={digitsOf(isbnInput).length < 8} className="rounded-xl bg-forest px-5 py-3 text-sm font-bold text-paper transition enabled:hover:bg-forest-light disabled:opacity-40">Find</button>
              </div>
            )}
            <button onClick={() => setManual(!manual)} className="mt-5 text-xs font-semibold text-forest underline">Can't find your book? {manual ? "Hide" : "Enter it manually"}</button>
            {manual && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
                <div className="flex flex-col gap-2 rounded-2xl border border-mist bg-paper p-4">
                  <input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="Book title *" className="rounded-xl border border-mist bg-mist/40 px-4 py-2.5 text-sm outline-none focus:border-forest" />
                  <input value={mAuthor} onChange={(e) => setMAuthor(e.target.value)} placeholder="Author *" className="rounded-xl border border-mist bg-mist/40 px-4 py-2.5 text-sm outline-none focus:border-forest" />
                  <div className="flex gap-2">
                    <select value={mGenre} onChange={(e) => setMGenre(e.target.value)} className="flex-1 rounded-xl border border-mist bg-mist/40 px-3 py-2.5 text-sm outline-none focus:border-forest">
                      {GENRES.map((g) => <option key={g}>{g}</option>)}
                    </select>
                    <input value={mYear} onChange={(e) => setMYear(e.target.value)} placeholder="Year" inputMode="numeric" className="w-24 rounded-xl border border-mist bg-mist/40 px-3 py-2.5 text-sm outline-none focus:border-forest" />
                  </div>
                  <button onClick={pickManual} disabled={!mTitle.trim() || !mAuthor.trim()} className="mt-1 rounded-full bg-forest py-2.5 text-sm font-bold text-paper transition enabled:hover:bg-forest-light disabled:opacity-40">Use these details</button>
                </div>
              </motion.div>
            )}
            {scanMsg && <p className="mt-3 rounded-xl bg-amber/15 px-4 py-2.5 text-center text-xs font-semibold text-amber-deep">{scanMsg}</p>}
          </motion.div>

        /* ─── PHOTOS ─── */
        ) : phase === "photos" && book ? (
          <motion.div key="photos" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <div className="flex gap-4 rounded-2xl bg-gradient-to-r from-forest-deep to-forest p-4 text-paper shadow-[0_16px_36px_rgba(18,43,33,0.3)]">
              <CoverImg src={coverUrl(book.isbn)} alt={book.title} className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-xl ring-1 ring-paper/20" />
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-amber px-2.5 py-0.5 text-[10px] font-black text-forest-deep">{manual ? "Added by you" : "Auto-filled ✓"}</span>
                <p className="font-display mt-1.5 line-clamp-2 text-lg leading-tight font-semibold">{book.title}</p>
                <p className="text-xs text-paper/70">{book.author}</p>
              </div>
            </div>

            <p className="mt-6 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Upload Book Photos</p>
            <p className="mt-1 text-xs text-ink-soft">Take clear photos from each angle. More photos = higher BookScore.</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PHOTO_SLOTS.map((slot) => (
                <button key={slot} onClick={() => photoInputRef.current?.click()}
                  className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border p-1.5 transition ${photos[slot] ? "border-moss bg-moss/10" : "border-dashed border-mist bg-paper hover:border-forest/50"}`}>
                  {photos[slot] ? (
                    <>
                      <img src={photos[slot]!} alt={slot} className="absolute inset-0 h-full w-full rounded-xl object-cover" />
                      <span className="absolute right-1 bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-moss text-[9px] font-black text-forest-deep">✓</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">{slot === "Front" ? "📷" : slot === "Back" ? "📷" : slot === "Spine" ? "📖" : slot.includes("Edge") ? "📐" : "📄"}</span>
                      <span className="text-center text-[8px] leading-tight font-bold text-ink-soft">{slot}</span>
                    </>
                  )}
                </button>
              ))}
              <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const slot = PHOTO_SLOTS.find((s) => !photos[s]) ?? "Front"; onSlotPhoto(slot, f) }} />
            </div>
            <p className="mt-2 text-center text-[11px] text-ink-soft">{photoCount}/7 photos uploaded</p>

            <div className="mt-7 flex gap-2.5">
              <button onClick={() => setPhase("finding")} className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50">Back</button>
              <button onClick={() => { setInspectStep(0); setPhase("inspecting") }}
                className="flex-[2] rounded-full bg-forest py-3.5 font-bold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.02] hover:bg-forest-light active:scale-95">
                ✨ Inspect My Book
              </button>
            </div>
          </motion.div>

        /* ─── HEALTH REPORT ─── */
        ) : phase === "health" && report && book ? (
          <motion.div key="health" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <div className="flex gap-4 rounded-2xl bg-gradient-to-r from-forest-deep to-forest p-4 text-paper shadow-[0_16px_36px_rgba(18,43,33,0.3)]">
              <CoverImg src={coverUrl(book.isbn)} alt={book.title} className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-xl ring-1 ring-paper/20" />
              <div className="min-w-0 flex-1">
                <p className="font-display line-clamp-2 text-lg leading-tight font-semibold">{book.title}</p>
                <p className="text-xs text-paper/70">{book.author}</p>
              </div>
            </div>

            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="mt-6 rounded-2xl border border-mist bg-paper p-5 shadow-sm text-center">
              <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Book Health</p>
              <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="font-display mt-2 text-5xl font-black text-forest">{report.overallScore}<span className="text-2xl text-ink-soft">/100</span></motion.p>
              <p className="mt-1 text-lg text-amber">{"⭐".repeat(report.stars)}</p>
            </motion.div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Condition</p>
                <p className="font-display mt-1 text-lg font-bold text-ink">{conditionMeta(report.condition).emoji} {conditionMeta(report.condition).label}</p>
              </div>
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">AI Confidence</p>
                <p className="font-display mt-1 text-lg font-bold text-forest">{report.aiConfidence}%</p>
              </div>
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Exterior</p>
                <p className="font-display mt-1 text-lg font-bold text-ink">{report.exteriorScore}</p>
              </div>
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Interior</p>
                <p className="font-display mt-1 text-lg font-bold text-ink">{report.interiorScore}</p>
              </div>
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Binding</p>
                <p className="font-display mt-1 text-lg font-bold text-ink">{report.bindingScore}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-mist bg-paper p-4 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Detected Issues</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {report.issues.map((iss) => (
                  <div key={iss.label} className="flex items-center gap-2">
                    <span className={iss.passed ? "text-moss" : "text-red-500"}>{iss.passed ? "✓" : "✗"}</span>
                    <span className="text-sm text-ink">{iss.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 flex gap-2.5">
              <button onClick={() => setPhase("photos")} className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50">Back</button>
              <button onClick={() => setPhase("price")} className="flex-[2] rounded-full bg-forest py-3.5 font-bold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.02] hover:bg-forest-light active:scale-95">
                Continue to Pricing →
              </button>
            </div>
          </motion.div>

        /* ─── PRICE ─── */
        ) : phase === "price" && priceRecommendation && book ? (
          <motion.div key="price" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <div className="flex gap-4 rounded-2xl bg-gradient-to-r from-forest-deep to-forest p-4 text-paper shadow-[0_16px_36px_rgba(18,43,33,0.3)]">
              <CoverImg src={coverUrl(book.isbn)} alt={book.title} className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-xl ring-1 ring-paper/20" />
              <div className="min-w-0 flex-1">
                <p className="font-display line-clamp-2 text-lg leading-tight font-semibold">{book.title}</p>
                <p className="text-xs text-paper/70">{book.author}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-mist bg-paper p-5 shadow-sm text-center">
              <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">AI Recommended Price</p>
              <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="font-display mt-2 text-5xl font-black text-forest">
                ${priceRecommendation.recommended}
              </motion.p>
              <p className="mt-1 text-sm text-ink-soft">Fair range: ${priceRecommendation.fairLow}–${priceRecommendation.fairHigh}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Demand</p>
                <p className={`font-display mt-1 text-lg font-bold ${demand?.level === "High" ? "text-forest" : demand?.level === "Medium" ? "text-amber" : "text-ink"}`}>{priceRecommendation.demand}</p>
              </div>
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Expected Sale</p>
                <p className="font-display mt-1 text-lg font-bold text-ink">{priceRecommendation.expectedSaleDays}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Confidence</p>
                <p className="font-display mt-1 text-lg font-bold text-forest">{priceRecommendation.confidence}%</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={acceptSuggestedPrice} className={`flex-1 rounded-full py-3 font-bold text-sm transition ${priceMode === "suggested" ? "bg-forest text-paper shadow-md shadow-forest/20" : "border border-mist bg-paper text-ink-soft hover:bg-mist/50"}`}>
                ✓ Accept ${priceRecommendation.recommended}
              </button>
              <button onClick={enterCustomPrice} className={`flex-1 rounded-full py-3 font-bold text-sm transition ${priceMode === "custom" ? "bg-forest text-paper shadow-md shadow-forest/20" : "border border-mist bg-paper text-ink-soft hover:bg-mist/50"}`}>
                Enter My Price
              </button>
            </div>

            {priceMode === "custom" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
                <div className="flex items-center gap-2 rounded-2xl border border-mist bg-paper p-3 shadow-sm">
                  <span className="text-xl font-bold text-ink">$</span>
                  <input value={customPriceInput} onChange={(e) => setCustomPriceInput(e.target.value)} inputMode="decimal" className="flex-1 bg-transparent text-2xl font-bold text-ink outline-none" />
                  <button onClick={applyCustomPrice} className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-paper">Set</button>
                </div>
              </motion.div>
            )}

            {priceFeedback && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-4 rounded-2xl border p-4 shadow-sm ${
                priceFeedback.label === "perfect" ? "border-moss bg-moss/5" : priceFeedback.label === "expensive" ? "border-orange-400 bg-orange-50" : "border-amber bg-amber/5"
              }`}>
                <p className={`text-sm font-semibold ${priceFeedback.label === "perfect" ? "text-moss" : priceFeedback.label === "expensive" ? "text-orange-600" : "text-amber-deep"}`}>
                  {priceFeedback.label === "perfect" ? "🟢 " : "⚠️ "}{priceFeedback.message}
                </p>
                {priceFeedback.extra && <p className="mt-1 text-xs text-ink-soft">{priceFeedback.extra}</p>}
              </motion.div>
            )}

            <div className="mt-7 flex gap-2.5">
              <button onClick={() => setPhase("health")} className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50">Back</button>
              <button onClick={() => { setEarnings(calculateEarnings(price, delivery)); setPhase("delivery") }}
                className="flex-[2] rounded-full bg-forest py-3.5 font-bold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.02] hover:bg-forest-light active:scale-95">
                Choose Delivery →
              </button>
            </div>
          </motion.div>

        /* ─── DELIVERY ─── */
        ) : phase === "delivery" && book ? (
          <motion.div key="delivery" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">How do you want to deliver?</p>
            <div className="mt-3 flex flex-col gap-3">
              {DELIVERY_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => updateDelivery(opt.id)}
                  className={`rounded-2xl border p-4 text-left transition ${delivery === opt.id ? "border-forest bg-forest/5 shadow-md shadow-forest/10 ring-2 ring-forest" : "border-mist bg-paper hover:border-forest/40"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-sm font-bold text-ink">{opt.label}</p>
                        {opt.badge && <span className="rounded-full bg-amber px-2 py-0.5 text-[9px] font-black text-forest-deep">{opt.badge}</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-soft">{opt.description}</p>
                    </div>
                    <div className={`h-5 w-5 rounded-full border-2 ${delivery === opt.id ? "border-forest bg-forest" : "border-mist"}`}>
                      {delivery === opt.id && <div className="mx-auto mt-0.5 h-2 w-2 rounded-full bg-paper" />}
                    </div>
                  </div>
                  <div className="mt-2 ml-11 flex flex-col gap-0.5">
                    {opt.details.map((d) => <p key={d} className="text-[11px] text-ink-soft">• {d}</p>)}
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-5 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Pickup location</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LOCATIONS.map((l) => <button key={l} className={chip(location === l)} onClick={() => setLocation(l)}>📍 {l}</button>)}
            </div>

            <p className="mt-5 text-[10px] font-bold tracking-widest text-ink-soft uppercase">Trade type</p>
            <div className="mt-2 flex gap-2">
              {([
                { id: "sell", label: "Sell Only", emoji: "💰" },
                { id: "swap", label: "Swap Only", emoji: "🔁" },
                { id: "both", label: "Sell or Swap", emoji: "🤝" },
              ] as const).map((m) => (
                <button key={m.id} className={`flex-1 ${chip(swapMode === m.id)} flex flex-col items-center gap-0.5 py-2.5`} onClick={() => setSwapMode(m.id)}>
                  <span className="text-base">{m.emoji}</span>
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-7 flex gap-2.5">
              <button onClick={() => setPhase("price")} className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50">Back</button>
              <button onClick={() => { setEarnings(calculateEarnings(price, delivery)); setPhase("earnings") }}
                className="flex-[2] rounded-full bg-forest py-3.5 font-bold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.02] hover:bg-forest-light active:scale-95">
                View Earnings →
              </button>
            </div>
          </motion.div>

        /* ─── EARNINGS + INSIGHTS ─── */
        ) : phase === "earnings" && earnings && book ? (
          <motion.div key="earnings" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <div className="rounded-2xl border border-mist bg-paper p-5 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Net Earnings</p>
              <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="font-display mt-2 text-5xl font-black text-forest">
                ${earnings.netEarnings.toFixed(2)}
              </motion.p>
              <div className="mt-4 flex flex-col gap-2 border-t border-mist pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">Selling Price</span>
                  <span className="font-semibold text-ink">{formatPrice(earnings.sellingPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">BookLoop Commission (5%)</span>
                  <span className="font-semibold text-red-500">-{formatPrice(earnings.commission)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">Payment Processing</span>
                  <span className="font-semibold text-red-500">-{formatPrice(earnings.processingFee)}</span>
                </div>
                {earnings.fulfillmentFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">BookLoop Fulfillment</span>
                    <span className="font-semibold text-red-500">-{formatPrice(earnings.fulfillmentFee)}</span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] text-ink-soft text-center italic">This is the estimated amount that will be transferred to your bank account after successful delivery.</p>
            </div>

            {insights.length > 0 && (
              <div className="mt-5 rounded-2xl border border-mist bg-paper p-4 shadow-sm">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">AI Insights</p>
                <div className="mt-2 flex flex-col gap-2">
                  {insights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-base">{ins.icon}</span>
                      <span className={`text-sm ${ins.type === "positive" ? "text-forest" : ins.type === "warning" ? "text-orange-600" : "text-amber-deep"}`}>{ins.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex gap-2.5">
              <button onClick={() => setPhase("delivery")} className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50">Back</button>
              <button onClick={() => { runOptimize(); setPhase("optimize") }}
                className="flex-[2] rounded-full bg-gradient-to-r from-amber to-amber-deep py-3.5 font-bold text-forest-deep shadow-[0_10px_24px_rgba(217,138,31,0.35)]">
                ✨ Optimize My Listing
              </button>
            </div>
          </motion.div>

        /* ─── OPTIMIZE ─── */
        ) : phase === "optimize" && optimization && book ? (
          <motion.div key="optimize" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <div className="rounded-2xl border border-mist bg-paper p-5 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">✨ Optimization Suggestions</p>
              <div className="mt-3 flex flex-col gap-2">
                {optimization.optimizations.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-mist/30 px-3 py-2">
                    <span className="text-base">{opt.icon}</span>
                    <span className="flex-1 text-sm text-ink">{opt.text}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${opt.impact === "high" ? "bg-forest/10 text-forest" : opt.impact === "medium" ? "bg-amber/15 text-amber-deep" : "bg-mist text-ink-soft"}`}>{opt.impact.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Quality</p>
                <p className="font-display mt-1 text-2xl font-black text-forest">{optimization.qualityScore}<span className="text-sm text-ink-soft">/100</span></p>
              </div>
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Sell %</p>
                <p className="font-display mt-1 text-2xl font-black text-forest">{optimization.sellingProbability}%</p>
              </div>
              <div className="rounded-2xl border border-mist bg-paper p-3 shadow-sm text-center">
                <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Sale Time</p>
                <p className="font-display mt-1 text-lg font-bold text-ink">{optimization.estimatedSaleDays}</p>
              </div>
            </div>

            <div className="mt-7 flex gap-2.5">
              <button onClick={() => setPhase("earnings")} className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50">Back</button>
              <button onClick={() => setPhase("dashboard")}
                className="flex-[2] rounded-full bg-forest py-3.5 font-bold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.02] hover:bg-forest-light active:scale-95">
                Review & Publish →
              </button>
            </div>
          </motion.div>

        /* ─── DASHBOARD + PUBLISH ─── */
        ) : phase === "dashboard" && dashboard && earnings && priceRecommendation && demand && book ? (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-5">
            <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">Listing Summary</p>
            <div className="mt-2 rounded-2xl border border-mist bg-paper p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <CoverImg src={coverUrl(book.isbn)} alt={book.title} className="h-20 w-14 shrink-0 rounded-lg object-cover shadow" />
                <div className="min-w-0 flex-1">
                  <p className="font-display line-clamp-1 text-sm font-semibold text-ink">{book.title}</p>
                  <p className="text-xs text-ink-soft">{book.author}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {report && <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[9px] font-bold text-forest">{conditionMeta(report.condition).emoji} {conditionMeta(report.condition).label}</span>}
                    <span className="rounded-full bg-mist px-2 py-0.5 text-[9px] font-bold text-ink-soft">📍 {location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {dashboard.cards.map((c, i) => (
                <motion.div key={c.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-2xl border border-mist bg-paper px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase">{c.label}</p>
                      {c.sub && <p className="text-[11px] text-ink-soft">{c.sub}</p>}
                    </div>
                  </div>
                  <span className={`font-display text-lg font-black ${c.color === "green" ? "text-forest" : c.color === "amber" ? "text-amber-deep" : "text-ink"}`}>{c.value}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-7 flex gap-2.5">
              <button onClick={() => setPhase("optimize")} className="flex-1 rounded-full border border-mist py-3.5 font-semibold text-ink-soft transition hover:bg-mist/50">Back</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={listBook}
                className="flex-[2] rounded-full bg-gradient-to-r from-amber to-amber-deep py-3.5 font-bold text-forest-deep shadow-[0_10px_24px_rgba(217,138,31,0.35)]">
                📚 Publish Listing
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {scanning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 px-6">
          <div id="scan-stage" className="h-64 w-64 overflow-hidden rounded-2xl ring-4 ring-amber/60" />
          <p className="mt-5 max-w-xs text-center text-sm font-medium text-paper">Point your camera at the ISBN barcode on the back cover</p>
          <button onClick={() => { scanningRef.current = false; if (timeoutRef.current) clearTimeout(timeoutRef.current); stopCamera() }}
            className="mt-6 rounded-full bg-paper px-6 py-2.5 text-sm font-bold text-ink">Cancel scan</button>
        </div>
      )}
    </div>
  )
}
