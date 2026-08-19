export type Insight = {
  icon: string
  text: string
  type: "positive" | "suggestion" | "warning"
}

export function generateInsights(
  healthScore: number,
  demand: string,
  priceRelative: "cheap" | "perfect" | "expensive",
  expectedSaleDays: string,
  photoCount: number,
): Insight[] {
  const insights: Insight[] = []

  if (healthScore >= 85) {
    insights.push({ icon: "✅", text: "Excellent condition", type: "positive" })
  } else if (healthScore >= 70) {
    insights.push({ icon: "✅", text: "Good condition", type: "positive" })
  } else {
    insights.push({ icon: "⚠️", text: "Condition may reduce buyer interest", type: "warning" })
  }

  if (demand === "High") {
    insights.push({ icon: "🔥", text: "High buyer demand", type: "positive" })
  } else if (demand === "Medium") {
    insights.push({ icon: "📊", text: "Steady market demand", type: "positive" })
  } else {
    insights.push({ icon: "📉", text: "Lower demand — price competitively", type: "suggestion" })
  }

  if (priceRelative === "perfect") {
    insights.push({ icon: "💰", text: "Competitive pricing", type: "positive" })
  } else if (priceRelative === "cheap") {
    insights.push({ icon: "💡", text: "You could price higher", type: "suggestion" })
  } else {
    insights.push({ icon: "⚠️", text: "Price may slow the sale", type: "warning" })
  }

  insights.push({ icon: "⏱️", text: `Expected sale within ${expectedSaleDays}`, type: "positive" })

  const probability = Math.min(99, Math.round(healthScore * 0.4 + (demand === "High" ? 30 : demand === "Medium" ? 20 : 10) + photoCount * 3))
  insights.push({ icon: "🎯", text: `${probability}% chance of selling this week`, type: "positive" })

  return insights
}
