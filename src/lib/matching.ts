/**
 * Backward-compatibility layer for the UI screens.
 *
 * The real recommendation logic now lives in readingDimensions.ts,
 * recommendationEngine.ts, recommendationReasons.ts, personalityMapper.ts and
 * recommendationService.ts. This file keeps the exact function names and shapes
 * the screens already import, delegating scores and explanations to the engine
 * while preserving the small pure helpers (matchLabel, shortTitle, similarTo…).
 */
import type { Book, Listing } from "../data/books"
import { BOOKS } from "../data/books"
import { type ReaderGenome } from "./readingDimensions"
import { ARCHETYPES, personalityFromGenome, type Archetype } from "./personalityMapper"
import { buildGenomeFromAnswers } from "./readingDimensions"
import { recommendBook, genomeFromStorage, isExplorer, loadQuizAnswers } from "./recommendationService"
import { dynamicWhyList, dynamicWhyYoullLoveIt } from "./recommendationReasons"

export { setExplorerProfile, isExplorer, genomeFromStorage } from "./recommendationService"

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

/** The friendly Book DNA personality, derived from the hidden Reader Genome. */
export function archFromStorage(): Archetype {
  if (isExplorer()) return ARCHETYPES.explorer
  const answers = loadQuizAnswers()
  if (answers.length === 0) return ARCHETYPES.cozy
  return personalityFromGenome(buildGenomeFromAnswers(answers))
}

/** A swipe/marketplace card scored by the Recommendation Engine. */
export function buildCard(book: Book, listing: Listing, genome: ReaderGenome = genomeFromStorage()): SwipeCard {
  const h = hash(listing.id)
  const rec = recommendBook(book, genome)
  return {
    book,
    listing,
    match: rec.score,
    reason: rec.summary,
    distance: `${(0.4 + (h % 34) / 10).toFixed(1)} mi`,
    rating: 4.5 + (h % 6) / 10,
    verified: h % 3 !== 0,
    swaps: 40 + (h % 121),
    viewers: 4 + ((h >> 2) % 9),
    copies: 1 + ((h >> 4) % 2),
  }
}

export function matchLabel(value: number): string {
  if (value >= 88) return "Excellent Match"
  if (value >= 75) return "Great Match"
  return "Worth Exploring"
}

/**
 * "Why You'll Love This" rows for the swipe card. Pass the reader's genome for
 * dynamic, per-reader reasons; without it, falls back to the legacy tag copy.
 */
export function whyList(book: Book, genome?: ReaderGenome): { emoji: string; text: string }[] {
  if (genome) return dynamicWhyList(book, genome)
  const items = book.tags
    .filter((t) => WHY_PHRASES[t])
    .map((t) => ({ emoji: TAG_EMOJI[t] ?? "📖", text: WHY_PHRASES[t] }))
    .filter((item, i, arr) => arr.findIndex((x) => x.text === item.text) === i)
    .slice(0, 2)
  const similar = similarTo(book)
  if (similar) items.push({ emoji: "📚", text: `Similar to ${shortTitle(similar.title)}` })
  return items
}

/**
 * "Why You'll Love It" bullets for Book Details. Dynamic reasons when a genome
 * is supplied; legacy tag copy otherwise.
 */
export function whyYoullLoveIt(book: Book, genome?: ReaderGenome): string[] {
  if (genome) return dynamicWhyYoullLoveIt(book, genome)
  const phrases = book.tags.filter((t) => WHY_PHRASES[t]).map((t) => WHY_PHRASES[t])
  const unique = phrases.filter((p, i) => phrases.indexOf(p) === i)
  const list = unique.slice(0, 5)
  if (list.length === 0) list.push("A story readers keep coming back to")
  if (!list.includes("A reader favorite")) list.push("A reader favorite")
  return list.slice(0, 6)
}

export function similarTo(book: Book): Book | null {
  return BOOKS.find((b) => b.id !== book.id && b.tags.some((t) => book.tags.includes(t))) ?? null
}

export function shortTitle(title: string): string {
  const short = title.split(":")[0].trim()
  return short.length > 26 ? `${short.slice(0, 24)}…` : short
}

/** Legacy tag-based scoring — kept for any caller that hasn't moved to the engine. */
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

export function whyChips(book: Book): { emoji: string; label: string }[] {
  const chips = book.tags.filter((t) => TAG_CHIPS[t]).map((t) => TAG_CHIPS[t])
  const unique = chips.filter((c, i) => chips.findIndex((x) => x.label === c.label) === i)
  const similar = similarTo(book)
  if (similar && unique.length > 2) {
    return [...unique.slice(0, 2), { emoji: "📚", label: `Similar to ${shortTitle(similar.title)}` }]
  }
  return unique.slice(0, 3)
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

function hash(s: string): number {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973
  return Math.abs(h)
}
