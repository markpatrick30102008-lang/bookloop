import type { Book, Listing } from "../data/books"

export type MyListing = {
  id: string
  book: Book
  listing: Omit<Listing, "match"> & { match: number }
  score: number
  notes: string[]
}

export function loadMyListings(): MyListing[] {
  try {
    const raw = localStorage.getItem("bookloop.myListings")
    return raw ? (JSON.parse(raw) as MyListing[]) : []
  } catch {
    return []
  }
}

export function saveMyListing(l: MyListing) {
  const mine = loadMyListings()
  mine.push(l)
  localStorage.setItem("bookloop.myListings", JSON.stringify(mine))
}
