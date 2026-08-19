import type { Book } from "../data/books"
import { LISTINGS } from "../data/books"

export type DemandAnalysis = {
  level: "High" | "Medium" | "Low"
  score: number
  competingListings: number
  genrePopularity: number
  reason: string
}

const GENRE_POP: Record<string, number> = {
  Fantasy: 88,
  "Sci-Fi": 85,
  Thriller: 90,
  Romance: 82,
  "Self-Help": 92,
  "Non-Fiction": 78,
  Fiction: 75,
  Classic: 65,
  Dystopia: 85,
  Historical: 60,
}

export function analyzeDemand(book: Book): DemandAnalysis {
  const competing = LISTINGS.filter((l) => l.bookId === book.id && l.available).length
  const genrePop = GENRE_POP[book.genre] ?? 70

  const recencyBonus = book.year >= 2018 ? 8 : book.year >= 2010 ? 4 : 0
  const competitionPenalty = competing * 5
  const rawScore = genrePop + recencyBonus - competitionPenalty
  const score = Math.min(100, Math.max(20, rawScore))

  const level: "High" | "Medium" | "Low" = score >= 80 ? "High" : score >= 55 ? "Medium" : "Low"

  const reasons: Record<string, string> = {
    High: `${book.genre} is trending — buyers are actively searching.`,
    Medium: `Steady interest in ${book.genre} — a fair price will sell quickly.`,
    Low: `More supply than demand for this genre — price competitively.`,
  }

  return {
    level,
    score,
    competingListings: competing,
    genrePopularity: genrePop,
    reason: reasons[level],
  }
}
