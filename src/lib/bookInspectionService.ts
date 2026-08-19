import type { Book } from "../data/books"
import { LISTINGS } from "../data/books"

export type PhotoSlot = "Front" | "Back" | "Spine" | "Top Edge" | "Bottom Edge" | "Side Edge" | "Inside Pages"

export const PHOTO_SLOTS: PhotoSlot[] = ["Front", "Back", "Spine", "Top Edge", "Bottom Edge", "Side Edge", "Inside Pages"]

export const INSPECTION_STEPS = [
  "Checking cover...",
  "Checking pages...",
  "Checking spine...",
  "Calculating condition...",
  "Generating report...",
] as const

export type DetectedIssue = { label: string; passed: boolean }

export type InspectionReport = {
  overallScore: number
  stars: number
  condition: string
  aiConfidence: number
  exteriorScore: number
  interiorScore: number
  bindingScore: number
  issues: DetectedIssue[]
}

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 9973
  return Math.abs(h)
}

function clampScore(v: number): number {
  return Math.min(99, Math.max(60, Math.round(v)))
}

export function inspectBook(book: Book, photoCount: number, uploadedSlots: PhotoSlot[]): InspectionReport {
  const h = hash(book.isbn + photoCount)

  const hasFront = uploadedSlots.includes("Front")
  const hasSpine = uploadedSlots.includes("Spine")
  const hasInside = uploadedSlots.includes("Inside Pages")
  const hasEdge = uploadedSlots.includes("Top Edge") || uploadedSlots.includes("Bottom Edge") || uploadedSlots.includes("Side Edge")

  const baseScore = 70 + (h % 12)
  const photoBonus = Math.min(15, photoCount * 2.5)
  const hasFrontBonus = hasFront ? 3 : 0
  const hasSpineBonus = hasSpine ? 2 : 0
  const hasInsideBonus = hasInside ? 3 : 0
  const hasEdgeBonus = hasEdge ? 2 : 0
  const comprehensiveBonus = photoCount >= 5 ? 4 : 0

  const overallScore = clampScore(baseScore + photoBonus + hasFrontBonus + hasSpineBonus + hasInsideBonus + hasEdgeBonus + comprehensiveBonus)

  const exteriorScore = clampScore(baseScore + photoBonus * 0.6 + hasFrontBonus + hasSpineBonus + hasEdgeBonus)
  const interiorScore = clampScore(baseScore - 3 + photoBonus * 0.3 + (hasInside ? 5 : 0))
  const bindingScore = clampScore(baseScore + (hasSpine ? 6 : 0) + (hasInside ? 2 : 0))

  const condition = overallScore >= 90 ? "Like new" : overallScore >= 80 ? "Good" : overallScore >= 70 ? "Fair" : "Well loved"
  const stars = overallScore >= 90 ? 5 : overallScore >= 80 ? 4 : overallScore >= 70 ? 3 : 2
  const aiConfidence = clampScore(88 + (h % 10) + (photoCount >= 4 ? 3 : 0))

  const issues: DetectedIssue[] = [
    { label: "No writing", passed: h % 8 !== 0 },
    { label: "No water damage", passed: h % 10 !== 0 },
    { label: "Minor corner wear", passed: h % 6 !== 0 },
    { label: "Strong binding", passed: h % 12 !== 0 },
    { label: "Pages clean", passed: h % 7 !== 0 },
    { label: "Cover intact", passed: h % 9 !== 0 },
    { label: "Spine uncreased", passed: h % 11 !== 0 },
  ]

  return { overallScore, stars, condition, aiConfidence, exteriorScore, interiorScore, bindingScore, issues }
}

export function findSimilarListings(book: Book): typeof LISTINGS {
  return LISTINGS.filter((l) => l.bookId === book.id && l.available).slice(0, 5)
}

export function findGenreListings(_genre: string): typeof LISTINGS {
  return LISTINGS.filter((l) => l.available && l.condition !== "Well loved").slice(0, 8)
}
