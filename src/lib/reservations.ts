function loadReserved(): string[] {
  try {
    const raw = localStorage.getItem("bookloop.reserved")
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function isReserved(bookId: string): boolean {
  return loadReserved().includes(bookId)
}

export function markReserved(bookId: string) {
  const list = loadReserved()
  if (!list.includes(bookId)) {
    list.push(bookId)
    localStorage.setItem("bookloop.reserved", JSON.stringify(list))
  }
}
