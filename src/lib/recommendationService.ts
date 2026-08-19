/**
 * Recommendation Service — the public entry point to the recommendation stack.
 *
 *   Book DNA (Quiz answers)
 *        ↓
 *   Reader Genome (hidden 20-dimension profile)
 *        ↓
 *   Recommendation Engine (weighted compatibility)
 *        ↓
 *   BookMatch Score + dynamic "Why You'll Love This" reasons
 *
 * This module owns localStorage access and orchestration. It also defines the
 * future extension points (likes, skips, reserves, ratings, reading history,
 * AI learning) so they can be plugged in without touching the engine.
 */
import type { Book } from "../data/books"
import { DEFAULT_GENOMES, bookDimensionsOf, buildGenomeFromAnswers, type ReaderGenome } from "./readingDimensions"
import { compatibilityScore } from "./recommendationEngine"
import { reasonsFor, summaryFor } from "./recommendationReasons"
import { personalityFromGenome } from "./personalityMapper"

export function setExplorerProfile(): void {
  localStorage.setItem("bookloop.profile", "explorer")
}

export function isExplorer(): boolean {
  return localStorage.getItem("bookloop.profile") === "explorer" && !localStorage.getItem("bookloop.quiz")
}

export function loadQuizAnswers(): string[][] {
  try {
    const raw = localStorage.getItem("bookloop.quiz")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[][]) : []
  } catch {
    return []
  }
}

/** The reader's hidden profile, resolved from saved quiz answers. */
export function genomeFromStorage(): ReaderGenome {
  if (isExplorer()) return { ...DEFAULT_GENOMES.explorer }
  return buildGenomeFromAnswers(loadQuizAnswers())
}

export type Recommendation = {
  book: Book
  score: number
  reasons: string[]
  summary: string
}

/** Full recommendation for a single book: score + dynamic explanations. */
export function recommendBook(book: Book, genome: ReaderGenome = genomeFromStorage()): Recommendation {
  const dims = bookDimensionsOf(book)
  const personality = personalityFromGenome(genome)
  return {
    book,
    score: compatibilityScore(genome, dims),
    reasons: reasonsFor(genome, dims),
    summary: summaryFor(genome, dims, personality.name),
  }
}

/** Ranked recommendations across a set of books, best first. */
export function recommendBooks(books: readonly Book[], genome: ReaderGenome = genomeFromStorage()): Recommendation[] {
  return books.map((book) => recommendBook(book, genome)).sort((a, b) => b.score - a.score)
}

/**
 * ── Future extension points ──────────────────────────────────────────────────
 * Everything below is scaffolding for the AI layer. None of it affects current
 * behaviour, but the contracts are in place so these signals can later re-tune
 * a reader's genome without redesigning the engine.
 */

export type ReadingSignal =
  | { kind: "liked"; bookId: string }
  | { kind: "skipped"; bookId: string }
  | { kind: "reserved"; bookId: string }
  | { kind: "rated"; bookId: string; rating: number }
  | { kind: "read"; bookId: string }

/**
 * Records a reading signal for future AI learning. Today it only persists the
 * signal; nothing consumes it yet.
 */
export function recordReadingSignal(signal: ReadingSignal): void {
  try {
    const key = "bookloop.signals"
    const existing = localStorage.getItem(key)
    const list: ReadingSignal[] = existing ? (JSON.parse(existing) as ReadingSignal[]) : []
    list.push(signal)
    localStorage.setItem(key, JSON.stringify(list.slice(-500)))
  } catch {
    /* signals are best-effort */
  }
}

/**
 * Folds historical signals back into a genome. Provided so a future model can
 * learn from books liked, skipped, reserved, rated, or finished reading.
 */
export function applySignalsToGenome(genome: ReaderGenome, _signals: ReadingSignal[]): ReaderGenome {
  return { ...genome }
}
