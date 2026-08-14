export type Book = {
  id: string
  title: string
  author: string
  isbn: string
  genre: string
  year: number
  tags: string[]
}

export const coverUrl = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

export const BOOKS: Book[] = [
  { id: "b1", title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", isbn: "9780590353427", genre: "Fantasy", year: 1997, tags: ["fantasy", "escapist", "cozy"] },
  { id: "b2", title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780547928227", genre: "Fantasy", year: 1937, tags: ["fantasy", "escapist"] },
  { id: "b3", title: "Dune", author: "Frank Herbert", isbn: "9780441172719", genre: "Sci-Fi", year: 1965, tags: ["scifi", "escapist", "thinker"] },
  { id: "b4", title: "Project Hail Mary", author: "Andy Weir", isbn: "9780593135204", genre: "Sci-Fi", year: 2021, tags: ["scifi", "sleuth", "cozy"] },
  { id: "b5", title: "The Silent Patient", author: "Alex Michaelides", isbn: "9781250301697", genre: "Thriller", year: 2019, tags: ["mystery", "sleuth"] },
  { id: "b6", title: "Gone Girl", author: "Gillian Flynn", isbn: "9780307588371", genre: "Thriller", year: 2012, tags: ["mystery", "sleuth", "thinker"] },
  { id: "b7", title: "The Midnight Library", author: "Matt Haig", isbn: "9780525559474", genre: "Fiction", year: 2020, tags: ["heart", "literary", "cozy"] },
  { id: "b8", title: "Pride and Prejudice", author: "Jane Austen", isbn: "9780141439518", genre: "Classic", year: 1813, tags: ["heart", "cozy"] },
  { id: "b9", title: "Circe", author: "Madeline Miller", isbn: "9780316556347", genre: "Fantasy", year: 2018, tags: ["fantasy", "literary", "heart"] },
  { id: "b10", title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", genre: "Self-Help", year: 2018, tags: ["thinker", "cozy"] },
  { id: "b11", title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316097", genre: "Non-Fiction", year: 2011, tags: ["thinker", "literary"] },
  { id: "b12", title: "The Alchemist", author: "Paulo Coelho", isbn: "9780062315007", genre: "Fiction", year: 1988, tags: ["literary", "heart", "cozy"] },
  { id: "b13", title: "The Hunger Games", author: "Suzanne Collins", isbn: "9780439023481", genre: "Dystopia", year: 2008, tags: ["scifi", "escapist", "sleuth"] },
  { id: "b14", title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", genre: "Classic", year: 1925, tags: ["literary", "heart"] },
]

export type Listing = {
  id: string
  bookId: string
  seller: string
  price: number
  condition: string
  location: string
  match: number
  available: boolean
  swapOnly: boolean
}

export const EXTRA_BOOKS: Book[] = [
  { id: "x1", title: "1984", author: "George Orwell", isbn: "9780451524935", genre: "Dystopia", year: 1949, tags: ["thinker", "literary"] },
  { id: "x2", title: "Animal Farm", author: "George Orwell", isbn: "9780451526342", genre: "Dystopia", year: 1945, tags: ["thinker", "literary"] },
  { id: "x3", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", genre: "Classic", year: 1960, tags: ["heart", "literary"] },
  { id: "x4", title: "The Book Thief", author: "Markus Zusak", isbn: "9780375842207", genre: "Historical", year: 2005, tags: ["heart", "literary"] },
  { id: "x5", title: "Wonder", author: "R.J. Palacio", isbn: "9780375869020", genre: "Fiction", year: 2012, tags: ["heart", "cozy"] },
  { id: "x6", title: "The Fault in Our Stars", author: "John Green", isbn: "9780525478812", genre: "Romance", year: 2012, tags: ["heart", "literary"] },
  { id: "x7", title: "The Lightning Thief", author: "Rick Riordan", isbn: "9780786856299", genre: "Fantasy", year: 2005, tags: ["fantasy", "escapist"] },
  { id: "x8", title: "A Wrinkle in Time", author: "Madeleine L'Engle", isbn: "9780312367541", genre: "Sci-Fi", year: 1962, tags: ["scifi", "fantasy"] },
  { id: "x9", title: "The Outsiders", author: "S.E. Hinton", isbn: "9780142407332", genre: "Classic", year: 1967, tags: ["heart", "literary"] },
  { id: "x10", title: "Matilda", author: "Roald Dahl", isbn: "9780142410370", genre: "Fiction", year: 1988, tags: ["fantasy", "cozy"] },
  { id: "x11", title: "Charlie and the Chocolate Factory", author: "Roald Dahl", isbn: "9780142410318", genre: "Fantasy", year: 1964, tags: ["fantasy", "cozy"] },
]

export const ALL_BOOKS = [...BOOKS, ...EXTRA_BOOKS]

export function findBook(id: string): Book | undefined {
  return ALL_BOOKS.find((b) => b.id === id)
}

export const LISTINGS: Listing[] = [
  { id: "l1", bookId: "b1", seller: "Maya K.", price: 8, condition: "Good", location: "Campus Library", match: 96, available: true, swapOnly: false },
  { id: "l2", bookId: "b4", seller: "Diego R.", price: 11, condition: "Like new", location: "Hillview Ave", match: 92, available: true, swapOnly: false },
  { id: "l3", bookId: "b7", seller: "Aisha B.", price: 9, condition: "Good", location: "Riverside Café", match: 89, available: true, swapOnly: true },
  { id: "l4", bookId: "b5", seller: "Tom W.", price: 6, condition: "Fair", location: "Central Station", match: 87, available: true, swapOnly: false },
  { id: "l5", bookId: "b9", seller: "Sofia L.", price: 12, condition: "Like new", location: "Maple Street", match: 94, available: true, swapOnly: false },
  { id: "l6", bookId: "b3", seller: "Kenji T.", price: 10, condition: "Good", location: "Campus Library", match: 85, available: true, swapOnly: true },
  { id: "l7", bookId: "b11", seller: "Priya S.", price: 9, condition: "Good", location: "Riverside Café", match: 83, available: true, swapOnly: false },
  { id: "l8", bookId: "b10", seller: "Leo M.", price: 7, condition: "Fair", location: "Hillview Ave", match: 81, available: true, swapOnly: false },
  { id: "l9", bookId: "b13", seller: "Nina G.", price: 5, condition: "Good", location: "Central Station", match: 88, available: true, swapOnly: false },
  { id: "l10", bookId: "b8", seller: "Clara D.", price: 4, condition: "Fair", location: "Maple Street", match: 78, available: true, swapOnly: true },
  { id: "l11", bookId: "b2", seller: "Omar F.", price: 10, condition: "Good", location: "Campus Library", match: 90, available: true, swapOnly: false },
  { id: "l12", bookId: "b12", seller: "Emma J.", price: 6, condition: "Good", location: "Riverside Café", match: 84, available: true, swapOnly: false },
]

export const SYNOPSES: Record<string, string> = {
  b1: "The boy who lived begins his story: a letter, a train, a school of magic, and a secret hiding in plain sight. The first book that made a generation fall in love with reading.",
  b2: "Bilbo Baggins likes his quiet life — until a wizard and thirteen dwarves knock on his door. A gentle adventure about home, courage, and a very famous ring.",
  b3: "On the desert planet Arrakis, a young duke's heir inherits a war, a prophecy, and the most valuable substance in the universe. The cornerstone of modern science fiction.",
  b4: "A man wakes up on a spaceship with no memory of how he got there — and the only other crew member is a spider-like alien named Rocky. A brilliant, warm, laugh-out-loud survival story.",
  b5: "A famous painter shoots her husband and never speaks again. A psychotherapist is obsessed with getting her to talk. A debut thriller with a twist you will not see coming.",
  b6: "Nick and Amy Dunne look like the perfect couple — until Amy vanishes. A razor-sharp psychological thriller about marriage, media, and the stories we tell.",
  b7: "Nora Seed gets a second chance to live every life she might have lived. A warm, wise novel about regrets, possibilities, and the little choices that make a life.",
  b8: "Elizabeth Bennet is witty, stubborn, and sure she knows Mr. Darcy. He's proud, rich, and sure of himself too. The most beloved romance ever written.",
  b9: "Banished to a lonely island, a minor goddess discovers her powers and defies gods and mortals alike. A luminous retelling of myth from the woman at its edge.",
  b10: "Forget big goals — tiny changes, done daily, compound into remarkable results. The practical, habit-driven system that has changed millions of lives.",
  b11: "How did Homo sapiens — an unremarkable ape — come to rule the planet? A sweeping, mind-expanding story of humanity from the Stone Age to the algorithm age.",
  b12: "A shepherd boy travels across the desert chasing a recurring dream, learning that when you want something, the whole universe conspires to help you.",
  b13: "In Panem, the Capitol forces one boy and one girl from each district to fight to the death on live TV. Katniss volunteers to save her sister — and becomes a symbol.",
  b14: "Jay Gatsby throws dazzling parties across the bay, waiting for a green light and a love that's already gone. The great American novel about dreams and their cost.",
}

const SELLER_NAMES = ["Maya K.", "Diego R.", "Aisha B.", "Tom W.", "Sofia L.", "Kenji T.", "Priya S.", "Leo M.", "Nina G.", "Clara D.", "Omar F.", "Emma J."]
const CONDITIONS = ["Like new", "Good", "Fair"]
const LOCATIONS = ["Campus Library", "Hillview Ave", "Riverside Café", "Central Station", "Maple Street"]

export const MOODS = [
  { id: "all", label: "All moods", emoji: "📖" },
  { id: "fast", label: "Fast Reads", emoji: "⚡" },
  { id: "mystery", label: "Dark Mystery", emoji: "🕵️" },
  { id: "fantasy", label: "Fantasy", emoji: "🏰" },
  { id: "romance", label: "Romance", emoji: "❤️" },
  { id: "academic", label: "Academic", emoji: "🎓" },
  { id: "selfhelp", label: "Self-help", emoji: "🌱" },
]

export const BOOK_MOODS: Record<string, string[]> = {
  b1: ["fantasy"],
  b2: ["fantasy"],
  b3: ["fantasy", "academic"],
  b4: ["fast", "fantasy"],
  b5: ["mystery", "fast"],
  b6: ["mystery"],
  b7: ["romance", "fast"],
  b8: ["romance"],
  b9: ["fantasy", "romance"],
  b10: ["selfhelp", "fast", "academic"],
  b11: ["academic", "selfhelp"],
  b12: ["selfhelp", "romance", "fast"],
  b13: ["mystery", "fast"],
  b14: ["academic", "romance"],
}

export function listingFor(bookId: string): Listing {
  const h = hash(bookId)
  return {
    id: `syn-${bookId}`,
    bookId,
    seller: SELLER_NAMES[h % SELLER_NAMES.length],
    price: 4 + (h % 10),
    condition: CONDITIONS[h % CONDITIONS.length],
    location: LOCATIONS[(h >> 3) % LOCATIONS.length],
    match: 0,
    available: true,
    swapOnly: h % 5 === 0,
  }
}

function hash(s: string): number {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973
  return Math.abs(h)
}
