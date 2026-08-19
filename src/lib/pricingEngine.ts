import type { Book } from "../data/books"
import { LISTINGS } from "../data/books"

export type PriceRecommendation = {
  recommended: number
  fairLow: number
  fairHigh: number
  demand: "High" | "Medium" | "Low"
  expectedSaleDays: string
  confidence: number
}

const CONDITION_MULTIPLIER: Record<string, number> = {
  "Like new": 1.0,
  Good: 0.82,
  Fair: 0.65,
  "Well loved": 0.48,
}

const GENRE_DEMAND: Record<string, number> = {
  Fantasy: 1.15,
  "Sci-Fi": 1.1,
  Thriller: 1.12,
  Romance: 1.08,
  "Self-Help": 1.2,
  "Non-Fiction": 1.05,
  Fiction: 1.0,
  Classic: 0.95,
  Dystopia: 1.1,
  Historical: 0.92,
}

const BASE_PRICE_BY_GENRE: Record<string, number> = {
  Fantasy: 9,
  "Sci-Fi": 10,
  Thriller: 8,
  Romance: 7,
  "Self-Help": 11,
  "Non-Fiction": 10,
  Fiction: 8,
  Classic: 6,
  Dystopia: 9,
  Historical: 7,
}

export function recommendPrice(book: Book, healthScore: number, condition: string, sellerReputation: number): PriceRecommendation {
  const basePrice = BASE_PRICE_BY_GENRE[book.genre] ?? 8
  const conditionMult = CONDITION_MULTIPLIER[condition] ?? 0.82
  const demandMult = GENRE_DEMAND[book.genre] ?? 1.0
  const healthMult = 0.85 + (healthScore / 100) * 0.3
  const reputationMult = 0.9 + (sellerReputation / 5) * 0.2

  const yearBonus = book.year >= 2015 ? 1.05 : book.year >= 2000 ? 1.0 : 0.95

  const similarListings = LISTINGS.filter((l) => l.bookId === book.id && l.available)
  const avgListingPrice = similarListings.length > 0
    ? similarListings.reduce((s, l) => s + l.price, 0) / similarListings.length
    : basePrice

  const rawPrice = basePrice * conditionMult * demandMult * healthMult * reputationMult * yearBonus
  const marketAdjusted = similarListings.length > 0 ? (rawPrice * 0.6 + avgListingPrice * 0.4) : rawPrice

  const recommended = Math.round(Math.max(3, Math.min(18, marketAdjusted)) * 2) / 2
  const spread = Math.max(1, recommended * 0.07)
  const fairLow = Math.round((recommended - spread) * 2) / 2
  const fairHigh = Math.round((recommended + spread) * 2) / 2

  const demandScore = GENRE_DEMAND[book.genre] ?? 1.0
  const demand: "High" | "Medium" | "Low" = demandScore >= 1.1 ? "High" : demandScore >= 1.0 ? "Medium" : "Low"

  const expectedSaleDays = condition === "Like new"
    ? "3–5 Days"
    : condition === "Good"
      ? "5–7 Days"
      : condition === "Fair"
        ? "7–10 Days"
        : "10–14 Days"

  const confidence = Math.round(85 + (healthScore / 100) * 12 + (similarListings.length > 0 ? 3 : 0))

  return { recommended, fairLow, fairHigh, demand, expectedSaleDays, confidence: Math.min(99, confidence) }
}

export function evaluateCustomPrice(customPrice: number, recommendation: PriceRecommendation): { label: "expensive" | "cheap" | "perfect"; message: string; extra?: string } {
  if (customPrice > recommendation.fairHigh * 1.15) {
    return {
      label: "expensive",
      message: "This price is above the average market value.",
      extra: `You could sell faster at around $${recommendation.recommended}.`,
    }
  }
  if (customPrice < recommendation.fairLow * 0.85) {
    const extra = recommendation.recommended - customPrice
    return {
      label: "cheap",
      message: `You could earn around $${extra.toFixed(2)} more.`,
      extra: `Recommended: $${recommendation.fairLow}–${recommendation.fairHigh}`,
    }
  }
  return {
    label: "perfect",
    message: "Excellent Price — Competitive",
    extra: `Expected Sale: ${recommendation.expectedSaleDays}`,
  }
}
