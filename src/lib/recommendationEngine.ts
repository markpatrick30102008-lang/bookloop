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

/** Compatibility score for a Book object (resolves its dimension profile first). */
export function scoreBook(genome: ReaderGenome, book: Book): number {
  return compatibilityScore(genome, bookDimensionsOf(book))
}

/** Ranks books best-first for the given genome. */
export function rankBooks(genome: ReaderGenome, books: readonly Book[]): BookScore[] {
  return books
    .map((book) => ({ book, score: scoreBook(genome, book) }))
    .sort((a, b) => b.score - a.score)
}

/** The top-N books for the given genome. */
export function pickTopBooks(genome: ReaderGenome, books: readonly Book[], count: number): BookScore[] {
  return rankBooks(genome, books).slice(0, count)
}
