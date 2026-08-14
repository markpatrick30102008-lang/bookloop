import { BOOKS } from "../data/books"
import { seedChats } from "./chats"

export function seedDemoData() {
  localStorage.setItem("bookloop.name", "Alex Rivera")
  localStorage.setItem("bookloop.quiz", JSON.stringify([["escapist"], ["cozy"], ["mystery"], ["heart"], ["thinker"]]))
  localStorage.setItem("bookloop.likes", JSON.stringify(["b1", "b7", "b10", "b5", "b13"]))
  localStorage.setItem("bookloop.completed", JSON.stringify(["b4", "b9"]))
  localStorage.setItem("bookloop.city", "Campus, Riverside")
  localStorage.setItem("bookloop.joined", "Jun 2026")
  localStorage.setItem(
    "bookloop.myListings",
    JSON.stringify([
      {
        id: "my-demo-1",
        book: BOOKS.find((b) => b.id === "b12")!,
        listing: { id: "my-demo-1", bookId: "b12", seller: "You", price: 6, condition: "Good", location: "Riverside Café", match: 0, available: true, swapOnly: false },
        score: 88,
        notes: ["Slight corner wear"],
      },
      {
        id: "my-demo-2",
        book: BOOKS.find((b) => b.id === "b8")!,
        listing: { id: "my-demo-2", bookId: "b8", seller: "You", price: 4, condition: "Well loved", location: "Central Station", match: 0, available: true, swapOnly: true },
        score: 76,
        notes: ["Torn cover edge", "Name written inside"],
      },
    ]),
  )
  seedChats()
}
