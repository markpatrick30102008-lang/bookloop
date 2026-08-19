export type DeliveryOption = "seller-ship" | "fulfillment"

export type EarningsBreakdown = {
  sellingPrice: number
  commission: number
  processingFee: number
  fulfillmentFee: number
  deliveryCost: number
  netEarnings: number
}

const COMMISSION_RATE = 0.05
const PROCESSING_FEE = 0.30
const FULFILLMENT_RATE = 0.15
const SELLER_SHIP_COST = 0

export function calculateEarnings(price: number, delivery: DeliveryOption): EarningsBreakdown {
  const commission = Math.round(price * COMMISSION_RATE * 100) / 100
  const processingFee = PROCESSING_FEE
  const fulfillmentFee = delivery === "fulfillment" ? Math.round(price * FULFILLMENT_RATE * 100) / 100 : 0
  const deliveryCost = delivery === "seller-ship" ? SELLER_SHIP_COST : 0
  const netEarnings = Math.max(0, Math.round((price - commission - processingFee - fulfillmentFee - deliveryCost) * 100) / 100)

  return { sellingPrice: price, commission, processingFee, fulfillmentFee, deliveryCost, netEarnings }
}

export function formatPrice(n: number): string {
  return `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`
}
