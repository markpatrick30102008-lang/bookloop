/**
 * Recommendation Reasons — dynamic, human explanations for every match.
 *
 * Reasons are generated from the overlap between the reader's genome and the
 * book's profile, so the same book can explain itself differently to different
 * readers. Examples:
 *   - "You enjoy immersive worlds."
 *   - "You like fast-paced stories."
 *   - "You prefer character-driven novels."
 *   - "Similar readers enjoyed this book."
 */
import type { Book } from "../data/books"
import { DIMENSION_IDS, bookDimensionsOf, type DimensionId, type ReaderGenome } from "./readingDimensions"

/** Sentence fragments, phrased so "You …" reads naturally. */
export const DIMENSION_REASON_PARTS: Record<DimensionId, string> = {
  mystery: "love cracking the case",
  fantasy: "enjoy escaping into fantasy worlds",
  scifi: "like imagining the future",
  romance: "love a story with heart",
  adventure: "love a good adventure",
  thriller: "like stories that keep you on edge",
  historical: "like stories set in the past",
  biography: "enjoy real-life stories",
  literary: "love beautiful writing",
  philosophy: "like books that make you think",
  worldBuilding: "enjoy immersive worlds",
  characterDriven: "prefer character-driven novels",
  plotTwists: "love a good twist",
  fastPace: "like fast-paced stories",
  emotional: "read for stories that move you",
  humor: "enjoy witty, funny books",
  darkThemes: "are drawn to darker stories",
  educational: "read to learn something new",
  cozy: "like warm, feel-good reads",
  complex: "enjoy layered, complex books",
}

export const DIMENSION_EMOJI: Record<DimensionId, string> = {
  mystery: "🔍",
  fantasy: "🏰",
  scifi: "🚀",
  romance: "❤️",
  adventure: "🧭",
  thriller: "🕵️",
  historical: "🏛️",
  biography: "📖",
  literary: "✒️",
  philosophy: "🧠",
  worldBuilding: "🌍",
  characterDriven: "💛",
  plotTwists: "🌀",
  fastPace: "⚡",
  emotional: "💫",
  humor: "😄",
  darkThemes: "🌑",
  educational: "🎓",
  cozy: "🧸",
  complex: "🧩",
}

/** The dimensions where the reader's preference and the book's profile both run deep. */
export function topSharedDimensions(genome: ReaderGenome, book: ReaderGenome, count = 3): DimensionId[] {
  return DIMENSION_IDS.map((d) => ({ d, shared: Math.min(genome[d], book[d]) }))
    .filter((x) => x.shared >= 40)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, count)
    .map((x) => x.d)
}

/** Full-sentence reasons ("You enjoy immersive worlds."), falling back to social proof. */
export function reasonsFor(genome: ReaderGenome, book: ReaderGenome, count = 3): string[] {
  const dims = topSharedDimensions(genome, book, count)
  const reasons = dims.map((d) => `You ${DIMENSION_REASON_PARTS[d]}.`)
  if (reasons.length === 0) reasons.push("Similar readers enjoyed this book.")
  return reasons
}

/** One-line summary used on cards ("We picked this because you're … — you … and …"). */
export function summaryFor(genome: ReaderGenome, book: ReaderGenome, personalityName: string): string {
  const dims = topSharedDimensions(genome, book, 2)
  if (dims.length === 0) {
    return `We picked this because you're ${personalityName} — a story readers keep coming back to.`
  }
  const parts = dims.map((d) => DIMENSION_REASON_PARTS[d])
  return `We picked this because you're ${personalityName} — you ${parts.join(" and you ")}.`
}

/** Emoji + text rows for the swipe card's "Why You'll Love This" panel. */
export function dynamicWhyList(book: Book, genome: ReaderGenome): { emoji: string; text: string }[] {
  const dims = topSharedDimensions(genome, bookDimensionsOf(book), 3)
  const items = dims.map((d) => ({ emoji: DIMENSION_EMOJI[d], text: `You ${DIMENSION_REASON_PARTS[d]}.` }))
  if (items.length === 0) items.push({ emoji: "📚", text: "Similar readers enjoyed this book." })
  return items
}

/** Bulleted explanation list for the Book Details "Why You'll Love It" panel. */
export function dynamicWhyYoullLoveIt(book: Book, genome: ReaderGenome): string[] {
  const dims = topSharedDimensions(genome, bookDimensionsOf(book), 4)
  const items = dims.map((d) => `You ${DIMENSION_REASON_PARTS[d]}.`)
  items.push("Similar readers enjoyed this book.")
  return items
}
