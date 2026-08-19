export type DeliveryMode = {
  id: "seller-ship" | "fulfillment"
  label: string
  emoji: string
  description: string
  details: string[]
  badge?: string
}

export const DELIVERY_OPTIONS: DeliveryMode[] = [
  {
    id: "seller-ship",
    label: "Seller Ships",
    emoji: "📦",
    description: "Pack and ship the book yourself after it sells.",
    details: ["Best for occasional sellers", "No additional fees", "You handle packaging"],
  },
  {
    id: "fulfillment",
    label: "BookLoop Fulfillment",
    emoji: "⭐",
    description: "BookLoop arranges pickup and handles everything.",
    details: [
      "BookLoop picks up from your address",
      "Stored in a fulfillment center",
      "Professionally packed and shipped",
      "Tracking provided to buyer",
      "You never ship individual orders",
    ],
    badge: "PREMIUM",
  },
]
