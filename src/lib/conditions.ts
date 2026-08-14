export const CONDITION_LEVELS = [
  { id: "Like new", emoji: "🟢", label: "Like New", cls: "text-moss", ring: "ring-moss", sub: "Read once, perfect" },
  { id: "Good", emoji: "🟡", label: "Good", cls: "text-amber", ring: "ring-amber", sub: "Light wear, no marks" },
  { id: "Fair", emoji: "🟠", label: "Fair", cls: "text-orange-500", ring: "ring-orange-400", sub: "Visible wear, all pages" },
  { id: "Well loved", emoji: "🔴", label: "Well Loved", cls: "text-red-500", ring: "ring-red-500", sub: "Loved hard, still readable" },
] as const

export function conditionMeta(id?: string | null) {
  return CONDITION_LEVELS.find((c) => c.id === id) ?? CONDITION_LEVELS[1]
}
