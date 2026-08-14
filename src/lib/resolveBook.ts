import { LISTINGS, findBook, listingFor } from "../data/books"
import { buildCard, archFromStorage, type SwipeCard } from "./matching"
import { loadMyListings } from "./myListings"

export function resolveCard(id: string | undefined): SwipeCard | null {
  if (!id) return null
  const mine = loadMyListings().find((m) => m.book.id === id || m.listing.id === id)
  if (mine) {
    const card = buildCard(mine.book, mine.listing, archFromStorage())
    return { ...card, score: mine.score, verified: true }
  }
  const book = findBook(id)
  if (!book) return null
  const listing = LISTINGS.find((l) => l.bookId === book.id) ?? listingFor(book.id)
  return buildCard(book, listing, archFromStorage())
}
