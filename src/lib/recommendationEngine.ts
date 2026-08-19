/**
 * Recommendation Engine — pure scoring + ranking.
 *
 * Compares a reader's hidden Reader Genome against a book's dimension profile,
 * computes a weighted compatibility score, ranks books, and returns the best
 * recommendations. No localStorage, no side effects — the service layer decides
 * which genome and books to feed in, so this stays testable and AI-ready.
 */
import type { Book } from "../data/books"
import { DIMENSION_IDS, bookDimensionsOf, type ReaderGenome } from "./readingDimensions"

export type BookScore = {
  book: Book
  score: number
}

/**
 * Weighted compatibility score between a reader genome and a book profile.
 *
 * Uses a "coverage" model: for each dimension, the book can only satisfy as
 * much of the reader's taste as both sides share (`min`). The fraction of the
 * reader's total reading needs the book fulfils becomes the compatibility.
 * A perfect match reads ~100; a book with nothing in common reads much lower.
 *
 * Result is shaped into the familiar 55–99 display range.
 */
export function compatibilityScore(genome: ReaderGenome, book: ReaderGenome): number {
  const total = DIMENSION_IDS.reduce((sum, d) => sum + genome[d], 0)
  if (total <= 0) return 55
  let covered = 0
  for (const d of DIMENSION_IDS) covered += Math.min(genome[d], book[d])
  const coverage = covered / total
  return Math.min(99, Math.max(55, Math.round(52 + 47 * coverage)))
}

/**
 * Deterministic per-book nudge so scores land on natural-looking values
 * (e.g. 52, 58, 61, 67, 73, 76, 81, 84, 89, 93, 96) instead of clustering
 * on round numbers. Same book always gets the same score for the same genome.
 */
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973
  return Math.abs(h)
}

/** Compatibility score for a Book object, naturalized to a believable display value. */
export function scoreBook(genome: ReaderGenome, book: Book): number {
  const raw = compatibilityScore(genome, bookDimensionsOf(book))
  const nudge = (hashId(book.id) % 3) - 1
  return Math.min(98, Math.max(50, Math.round(raw / 3) * 3 + nudge))
}

/** Ranks books best-first for the given genome, spreading scores so a ranked list never repeats values. */
export function rankBooks(genome: ReaderGenome, books: readonly Book[]): BookScore[] {
  const ranked = books
    .map((book) => ({ book, score: scoreBook(genome, book) }))
    .sort((a, b) => b.score - a.score)
  let prev = 99
  return ranked.map((entry) => {
    let score = entry.score
    if (score >= prev) score = Math.max(50, prev - 2)
    prev = score
    return { book: entry.book, score }
  })
}

/** The top-N books for the given genome. */
export function pickTopBooks(genome: ReaderGenome, books: readonly Book[], count: number): BookScore[] {
  return rankBooks(genome, books).slice(0, count)
}
