import { BOOKS, EXTRA_BOOKS, LISTINGS, listingFor } from "../src/data/books"
import { CONDITION_LEVELS, conditionMeta } from "../src/lib/conditions"
import { resolveCard } from "../src/lib/resolveBook"
import { seedDemoData } from "../src/lib/demo"
import { loadChats } from "../src/lib/chats"
import { buildGenomeFromAnswers, bookDimensionsOf } from "../src/lib/readingDimensions"
import { compatibilityScore, rankBooks } from "../src/lib/recommendationEngine"
import { reasonsFor } from "../src/lib/recommendationReasons"
import { personalityFromGenome } from "../src/lib/personalityMapper"
import { genomeFromStorage } from "../src/lib/recommendationService"

const store = new Map<string, string>([
  ["bookloop.quiz", JSON.stringify([["escapist"], ["cozy"], ["mystery"], ["heart"], ["thinker"]])],
  ["bookloop.name", "Alex Rivera"],
])

;(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    store.set(k, String(v))
  },
  removeItem: (k: string) => {
    store.delete(k)
  },
}

let failed = 0
function assert(cond: boolean, msg: string) {
  if (!cond) {
    failed++
    console.error("  FAIL:", msg)
  }
}

console.log("RC verify: Book Details resolver")

// 1. Every catalog + extra book resolves with correct title
for (const b of [...BOOKS, ...EXTRA_BOOKS]) {
  const card = resolveCard(b.id)
  assert(card !== null, `resolveCard("${b.id}") should not be null`)
  assert(card && card.book.title === b.title, `title matches for ${b.id}`)
  assert(card && card.book.id === b.id, `id matches for ${b.id}`)
}

// 2. Unknown id never produces a card (page redirects, never blank)
assert(resolveCard("nope") === null, "unknown id resolves to null")
assert(resolveCard(undefined) === null, "undefined id resolves to null")

// 3. User listing integrity: an EXTRA book listed by the user keeps its own data
store.set(
  "bookloop.myListings",
  JSON.stringify([
    {
      id: "my-test",
      book: EXTRA_BOOKS[0],
      score: 81,
      listing: {
        id: "my-test",
        bookId: EXTRA_BOOKS[0].id,
        seller: "You",
        price: 4.5,
        condition: "Well loved",
        location: "Campus Library",
        match: 0,
        available: true,
        swapOnly: true,
      },
      notes: [],
    },
  ]),
)
const mine = resolveCard(EXTRA_BOOKS[0].id)
assert(mine !== null, "user listing resolves")
assert(mine && mine.listing.seller === "You", "user listing seller is You")
assert(mine && mine.listing.price === 4.5, "user listing price preserved")
assert(mine && mine.listing.condition === "Well loved", "user listing condition preserved")
assert(mine && mine.listing.location === "Campus Library", "user listing location preserved")
assert(mine && mine.score === 81, "user listing BookScore preserved")
assert(mine && mine.verified === true, "user listing is verified")

// 4. A user listing of a catalog book must NOT fall back to catalog seller
store.set(
  "bookloop.myListings",
  JSON.stringify([
    {
      id: "my-b12",
      book: BOOKS.find((b) => b.id === "b12")!,
      score: 88,
      listing: {
        id: "my-b12",
        bookId: "b12",
        seller: "You",
        price: 6,
        condition: "Good",
        location: "Riverside Café",
        match: 0,
        available: true,
        swapOnly: false,
      },
      notes: [],
    },
  ]),
)
const mineCat = resolveCard("b12")
assert(mineCat !== null, "catalog-book user listing resolves")
assert(mineCat && mineCat.listing.seller === "You", "catalog-book user listing uses You, not Emma J.")
assert(mineCat && mineCat.listing.price === 6, "catalog-book user listing keeps price")
assert(mineCat && mineCat.score === 88, "catalog-book user listing keeps BookScore")

// 5. Demo Mode data must resolve end to end
store.clear()
store.set("bookloop.quiz", JSON.stringify([["escapist"], ["cozy"], ["mystery"], ["heart"], ["thinker"]]))
seedDemoData()
for (const id of ["my-demo-1", "my-demo-2", "b12", "b8"]) {
  const card = resolveCard(id)
  assert(card !== null, `demo id "${id}" resolves`)
  if (id === "my-demo-1") {
    assert(card && card.listing.seller === "You" && card.listing.price === 6 && card.score === 88, "demo listing 1 shows You/6/88")
  }
  if (id === "my-demo-2") {
    assert(card && card.listing.seller === "You" && card.listing.price === 4 && card.listing.swapOnly === true, "demo listing 2 shows You/4/swap")
  }
}

// 6. Condition system: every condition used anywhere is canonical
const used = new Set<string>(CONDITION_LEVELS.map((c) => c.id))
for (const l of LISTINGS) used.add(l.condition)
for (let i = 0; i < 20; i++) used.add(listingFor(`b${i}`).condition)
const seeded = store.get("bookloop.myListings")
if (seeded) {
  for (const m of JSON.parse(seeded) as { listing: { condition: string } }[]) used.add(m.listing.condition)
}
for (const id of used) {
  assert(conditionMeta(id).id === id, `condition "${id}" resolves to itself (not the fallback)`)
}
assert(CONDITION_LEVELS.length === 4, "exactly four condition levels")
assert(new Set(CONDITION_LEVELS.map((c) => c.emoji)).size === 4, "four distinct condition emojis")

// 7. Seed chats are valid (verified flag present)
const chats = loadChats()
assert(chats.length === 3, "demo seeds 3 chats")
assert(chats.every((c) => typeof c.verified === "boolean"), "every seeded chat has a verified flag")

// 8. Recommendation Engine sanity
console.log("RC verify: Recommendation Engine")
const fantasyAnswers = [["fantasy"], ["escapist"], ["fantasy"], ["heart"], ["escapist"]]
const fantasyGenome = buildGenomeFromAnswers(fantasyAnswers)
const hp = BOOKS.find((b) => b.id === "b1")!
const pnp = BOOKS.find((b) => b.id === "b8")!
assert(
  compatibilityScore(fantasyGenome, bookDimensionsOf(hp)) > compatibilityScore(fantasyGenome, bookDimensionsOf(pnp)),
  "a fantasy-heavy genome ranks fantasy over romance",
)
const ranked = rankBooks(fantasyGenome, BOOKS)
assert(ranked[0].book.id === "b1", "top-ranked book for the fantasy genome is Harry Potter")
const reasons = reasonsFor(fantasyGenome, bookDimensionsOf(hp))
assert(reasons.length > 0, "dynamic recommendation reasons are generated")
assert(reasons.every((r) => r.trim().length > 0 && r.endsWith(".")), "reasons are non-empty sentences")
assert(personalityFromGenome(fantasyGenome).id === "escapist", "fantasy genome maps to The Escapist personality")
const genome = genomeFromStorage()
assert(Object.values(genome).every((v) => v >= 0 && v <= 100), "every genome dimension stays within 0–100")

console.log(failed === 0 ? "PASS: all release-candidate checks succeeded" : `FAIL: ${failed} check(s) failed`)
process.exit(failed === 0 ? 0 : 1)
