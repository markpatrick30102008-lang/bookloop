import type { Book } from "../data/books"
import type { PhotoSlot } from "./bookInspectionService"

export type Optimization = {
  icon: string
  text: string
  impact: "high" | "medium" | "low"
}

export type OptimizationResult = {
  optimizations: Optimization[]
  qualityScore: number
  sellingProbability: number
  estimatedSaleDays: string
}

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 9973
  return Math.abs(h)
}

export function analyzeListing(
  book: Book,
  photoCount: number,
  uploadedSlots: PhotoSlot[],
  price: number,
  condition: string,
  delivery: string,
): OptimizationResult {
  const h = hash(book.isbn + photoCount + price)
  const opts: Optimization[] = []

  if (!uploadedSlots.includes("Front") || !uploadedSlots.includes("Back")) {
    opts.push({ icon: "📷", text: "Add front and back cover photos", impact: "high" })
  }
  if (!uploadedSlots.includes("Spine")) {
    opts.push({ icon: "📸", text: "Add a spine photo", impact: "medium" })
  }
  if (!uploadedSlots.includes("Inside Pages")) {
    opts.push({ icon: "📄", text: "Add inside-page photos", impact: "medium" })
  }
  if (photoCount < 4) {
    opts.push({ icon: "✨", text: "Upload at least 5 photos for best results", impact: "medium" })
  }

  if (condition === "Like new" || condition === "Good") {
    opts.push({ icon: "🏷️", text: `Highlight "${condition}" condition in your listing`, impact: "medium" })
  }

  if (delivery !== "fulfillment") {
    opts.push({ icon: "🚚", text: "Switch to BookLoop Fulfillment for faster delivery", impact: "low" })
  }

  opts.push({ icon: "📝", text: "Add edition information if available", impact: "low" })

  if (opts.length > 0) {
    opts.push({ icon: "💰", text: "Price within the recommended range", impact: "high" })
  }

  const baseQuality = 60 + (photoCount * 5) + (h % 10)
  const qualityScore = Math.min(99, baseQuality)
  const sellingProbability = Math.min(99, Math.round(qualityScore * 0.95 + (h % 8)))
  const estimatedSaleDays = qualityScore >= 90 ? "1–2 Days" : qualityScore >= 80 ? "2–3 Days" : qualityScore >= 70 ? "3–5 Days" : "5–7 Days"

  return { optimizations: opts, qualityScore, sellingProbability, estimatedSaleDays }
}
