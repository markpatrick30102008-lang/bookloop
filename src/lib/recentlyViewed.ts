import { BOOKS } from "../data/books"

const KEY = "bookloop.recent"

export function recordView(id: string) {
  try {
    const list = loadIds().filter((x) => x !== id)
    list.unshift(id)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 8)))
  } catch {
    /* storage unavailable */
  }
}

export function loadRecent() {
  try {
    return loadIds()
      .map((id) => BOOKS.find((b) => b.id === id))
      .filter(Boolean) as (typeof BOOKS)[number][]
  } catch {
    return []
  }
}

function loadIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as string[]
  } catch {
    return []
  }
}