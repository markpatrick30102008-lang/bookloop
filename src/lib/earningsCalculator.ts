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
const PROCESSING_FEE = 5
const FULFILLMENT_RATE = 0.15
const SELLER_SHIP_COST = 0

export function calculateEarnings(price: number, delivery: DeliveryOption): EarningsBreakdown {
  const commission = Math.round(price * COMMISSION_RATE)
  const processingFee = PROCESSING_FEE
  const fulfillmentFee = delivery === "fulfillment" ? Math.round(price * FULFILLMENT_RATE) : 0
  const deliveryCost = delivery === "seller-ship" ? SELLER_SHIP_COST : 0
  const netEarnings = Math.max(0, price - commission - processingFee - fulfillmentFee - deliveryCost)

  return { sellingPrice: price, commission, processingFee, fulfillmentFee, deliveryCost, netEarnings }
}

export function formatPrice(n: number): string {
  return `₹${Math.round(n)}`
}
