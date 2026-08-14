import type { Book, Listing } from "../data/books"
import { BOOKS } from "../data/books"
import { ARCHETYPES, ARCHETYPE_ORDER, type Archetype } from "./quiz"

export function setExplorerProfile(): void {
  localStorage.setItem("bookloop.profile", "explorer")
}

export function isExplorer(): boolean {
  return localStorage.getItem("bookloop.profile") === "explorer" && !localStorage.getItem("bookloop.quiz")
}

const TAG_PHRASES: Record<string, string> = {
  fantasy: "worlds that sweep you away",
  escapist: "stories that are pure escape",
  scifi: "clever ideas about the future",
  sleuth: "twists that keep you guessing",
  mystery: "puzzles you can't put down",
  heart: "characters who feel like friends",
  literary: "writing that lingers in your mind",
  thinker: "books that make you think",
  cozy: "warm, feel-good comfort reads",
}

export function matchFor(arch: Archetype, book: Book): number {
  const overlap = book.tags.reduce((s, t) => s + (arch.tags.includes(t) ? 1 : 0), 0)
  return Math.min(99, 62 + overlap * 14)
}

export function explainMatch(arch: Archetype, tags: string[]): string {
  const matched = tags.filter((t) => TAG_PHRASES[t]).slice(0, 2).map((t) => TAG_PHRASES[t])
  if (matched.length === 0) {
    return `We picked this because you're a ${arch.name} at heart.`
  }
  return `We picked this because you're a ${arch.name} — you love ${matched.join(" and ")}.`
}

export type SwipeCard = {
  book: Book
  listing: Listing
  match: number
  reason: string
  distance: string
  rating: number
  verified: boolean
  badge?: string
  swaps: number
  viewers: number
  copies: number
  score?: number
}

export function matchLabel(value: number): string {
  if (value >= 88) return "Excellent Match"
  if (value >= 75) return "Great Match"
  return "Worth Exploring"
}

const TAG_EMOJI: Record<string, string> = {
  fantasy: "🌍",
  escapist: "🦋",
  scifi: "🚀",
  sleuth: "🌀",
  mystery: "🕵️",
  heart: "❤️",
  literary: "✍️",
  thinker: "🧠",
  cozy: "🫖",
}

export function whyList(book: Book): { emoji: string; text: string }[] {
  const items = book.tags
    .filter((t) => WHY_PHRASES[t])
    .map((t) => ({ emoji: TAG_EMOJI[t] ?? "📖", text: WHY_PHRASES[t] }))
    .filter((item, i, arr) => arr.findIndex((x) => x.text === item.text) === i)
    .slice(0, 2)
  const similar = similarTo(book)
  if (similar) items.push({ emoji: "📚", text: `Similar to ${shortTitle(similar.title)}` })
  return items
}

const TAG_CHIPS: Record<string, { emoji: string; label: string }> = {
  fantasy: { emoji: "🏰", label: "New worlds" },
  escapist: { emoji: "🌌", label: "Pure escape" },
  scifi: { emoji: "🚀", label: "Future ideas" },
  sleuth: { emoji: "🔍", label: "Twists" },
  mystery: { emoji: "🕵️", label: "Mystery" },
  heart: { emoji: "❤️", label: "Feels" },
  literary: { emoji: "📝", label: "Beautiful writing" },
  thinker: { emoji: "🧠", label: "Big ideas" },
  cozy: { emoji: "🛋️", label: "Feel-good" },
}

export function whyChips(book: Book): { emoji: string; label: string }[] {
  const chips = book.tags.filter((t) => TAG_CHIPS[t]).map((t) => TAG_CHIPS[t])
  const unique = chips.filter((c, i) => chips.findIndex((x) => x.label === c.label) === i)
  const similar = similarTo(book)
  if (similar && unique.length > 2) {
    return [...unique.slice(0, 2), { emoji: "📚", label: `Similar to ${shortTitle(similar.title)}` }]
  }
  return unique.slice(0, 3)
}

export function similarTo(book: Book): Book | null {
  return BOOKS.find((b) => b.id !== book.id && b.tags.some((t) => book.tags.includes(t))) ?? null
}

const WHY_PHRASES: Record<string, string> = {
  fantasy: "A whole new world to explore",
  escapist: "A pure escape from everyday life",
  scifi: "Mind-expanding ideas about the future",
  sleuth: "Twists you won't see coming",
  mystery: "A puzzle you can't put down",
  heart: "Characters who feel like real friends",
  literary: "Writing that stays with you long after",
  thinker: "Ideas that make you think deeply",
  cozy: "A warm, feel-good story",
}

export function whyYoullLoveIt(book: Book): string[] {
  const phrases = book.tags.filter((t) => WHY_PHRASES[t]).map((t) => WHY_PHRASES[t])
  const unique = phrases.filter((p, i) => phrases.indexOf(p) === i)
  const list = unique.slice(0, 5)
  if (list.length === 0) list.push("A story readers keep coming back to")
  if (!list.includes("A reader favorite")) list.push("A reader favorite")
  return list.slice(0, 6)
}

export function shortTitle(title: string): string {
  const short = title.split(":")[0].trim()
  return short.length > 26 ? `${short.slice(0, 24)}…` : short
}

export function buildCard(book: Book, listing: Listing, arch: Archetype): SwipeCard {
  const h = hash(listing.id)
  return {
    book,
    listing,
    match: matchFor(arch, book),
    reason: explainMatch(arch, book.tags),
    distance: `${(0.4 + (h % 34) / 10).toFixed(1)} mi`,
    rating: 4.5 + (h % 6) / 10,
    verified: h % 3 !== 0,
    swaps: 40 + (h % 121),
    viewers: 4 + ((h >> 2) % 9),
    copies: 1 + ((h >> 4) % 2),
  }
}

export function archFromStorage(): Archetype {
  if (isExplorer()) return ARCHETYPES.explorer
  const raw = localStorage.getItem("bookloop.quiz")
  let answers: string[][] = []
  try {
    answers = raw ? (JSON.parse(raw) as string[][]) : []
  } catch {
    answers = []
  }
  if (answers.length === 0) answers = [["cozy"]]
  const counts: Record<string, number> = {}
  for (const a of answers) for (const t of a) counts[t] = (counts[t] ?? 0) + 1
  let best: Archetype | null = null
  let bestScore = -1
  for (const id of ARCHETYPE_ORDER) {
    const arch = ARCHETYPES[id]
    const score = arch.tags.reduce((s, t) => s + (counts[t] ?? 0), 0)
    if (score > bestScore) {
      bestScore = score
      best = arch
    }
  }
  return best ?? ARCHETYPES.cozy
}

function hash(s: string): number {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973
  return Math.abs(h)
}
