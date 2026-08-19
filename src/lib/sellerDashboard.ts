import type { InspectionReport } from "./bookInspectionService"
import type { PriceRecommendation } from "./pricingEngine"
import type { EarningsBreakdown } from "./earningsCalculator"
import type { DemandAnalysis } from "./marketDemandService"
import type { OptimizationResult } from "./listingOptimizer"

export type DashboardCard = {
  label: string
  value: string
  sub?: string
  icon: string
  color: "green" | "amber" | "default"
}

export type DashboardData = {
  cards: DashboardCard[]
  ready: boolean
}

export function buildDashboard(
  report: InspectionReport,
  price: PriceRecommendation,
  earnings: EarningsBreakdown,
  demand: DemandAnalysis,
  optimization: OptimizationResult,
): DashboardData {
  return {
    cards: [
      { label: "Book Health", value: `${report.overallScore}%`, sub: "⭐".repeat(report.stars), icon: "📖", color: "green" },
      { label: "Demand", value: demand.level, sub: demand.reason, icon: "🔥", color: demand.level === "High" ? "green" : "default" },
      { label: "AI Fair Price", value: `$${price.recommended}`, sub: `$${price.fairLow}–${price.fairHigh}`, icon: "💡", color: "amber" },
      { label: "Net Earnings", value: `$${earnings.netEarnings.toFixed(2)}`, sub: "After all fees", icon: "💰", color: "green" },
      { label: "Expected Sale", value: price.expectedSaleDays, sub: `${price.confidence}% confidence`, icon: "⏱️", color: "default" },
      { label: "Selling Probability", value: `${optimization.sellingProbability}%`, sub: "Based on listing quality", icon: "🎯", color: "green" },
      { label: "Listing Quality", value: `${optimization.qualityScore}/100`, sub: `${optimization.optimizations.length} tips available`, icon: "✨", color: "amber" },
    ],
    ready: true,
  }
}
