export type ChatMessage = { from: "me" | "them"; text: string }

export type Chat = {
  id: string
  seller: string
  bookTitle: string
  bookIsbn: string
  messages: ChatMessage[]
  unread: number
  verified: boolean
  updatedAt: number
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return "Just now"
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem("bookloop.chats")
    return raw ? (JSON.parse(raw) as Chat[]) : []
  } catch {
    return []
  }
}

export function saveChats(chats: Chat[]) {
  localStorage.setItem("bookloop.chats", JSON.stringify(chats))
}

export function addReservationChat(seller: string, bookTitle: string, bookIsbn: string, verified: boolean): string {
  const chats = loadChats()
  const existing = chats.find((c) => c.seller === seller && c.bookTitle === bookTitle)
  if (existing) {
    existing.unread += 1
    existing.updatedAt = Date.now()
    existing.messages.push({
      from: "them",
      text: "I got your reservation request — this book is yours. Let's arrange a pickup!",
    })
    saveChats(chats)
    return existing.id
  }
  const id = `chat-${Date.now()}`
  chats.unshift({
    id,
    seller,
    bookTitle,
    bookIsbn,
    verified,
    unread: 1,
    updatedAt: Date.now(),
    messages: [{ from: "them", text: "I got your reservation request — this book is yours. Let's arrange a pickup!" }],
  })
  saveChats(chats)
  return id
}

export function totalUnread(): number {
  return loadChats().reduce((s, c) => s + c.unread, 0)
}

export function seedChats() {
  saveChats([
    {
      id: "demo-chat-1",
      seller: "Maya K.",
      bookTitle: "Harry Potter and the Sorcerer's Stone",
      bookIsbn: "9780590353427",
      verified: true,
      unread: 2,
      updatedAt: Date.now() - 25 * 60 * 1000,
      messages: [
        { from: "them", text: "Hi! I got your reservation request — this book is yours. Let's arrange a pickup!" },
        { from: "me", text: "Hi! I'm interested." },
        { from: "them", text: "Can we meet tomorrow?" },
        { from: "me", text: "Yes!" },
      ],
    },
    {
      id: "demo-chat-2",
      seller: "Diego R.",
      bookTitle: "Project Hail Mary",
      bookIsbn: "9780593135204",
      verified: true,
      unread: 1,
      updatedAt: Date.now() - 3 * 60 * 60 * 1000,
      messages: [{ from: "them", text: "Still available if you want it — swapping for anything Sci-Fi?" }],
    },
    {
      id: "demo-chat-3",
      seller: "Aisha B.",
      bookTitle: "The Midnight Library",
      bookIsbn: "9780525559474",
      verified: false,
      unread: 0,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      messages: [
        { from: "me", text: "Does it have any highlighting?" },
        { from: "them", text: "None at all — read once, kept in a sleeve." },
        { from: "me", text: "Done!" },
      ],
    },
  ])
}
