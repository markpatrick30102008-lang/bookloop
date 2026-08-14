import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate, useSearchParams } from "react-router-dom"
import { loadChats, saveChats, relativeTime, type Chat } from "../lib/chats"

const QUICK_REPLIES = ["Hi! I'm interested.", "Can we meet tomorrow?", "Yes!", "Done!"]
const AUTO_REPLIES = [
  "Sounds good! I'm near the pickup spot all day.",
  "Perfect — see you at the pickup spot!",
  "Great, I'll keep it aside for you.",
]

export function Messages() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const activeId = params.get("chat")
  const [chats, setChats] = useState<Chat[]>(() => loadChats())
  const [text, setText] = useState("")
  const [typing, setTyping] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const replyIdx = useRef(0)

  const active = chats.find((c) => c.id === activeId) ?? null

  useEffect(() => {
    if (active && active.unread > 0) {
      const next = chats.map((c) => (c.id === active.id ? { ...c, unread: 0 } : c))
      setChats(next)
      saveChats(next)
      window.dispatchEvent(new Event("bookloop:unread"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [active?.messages.length, typing])

  const openThread = (id: string) => {
    setParams({ chat: id })
  }

  const closeThread = () => {
    setParams({})
  }

  const send = (msg?: string) => {
    const body = (msg ?? text).trim()
    if (!body || !active) return
    const updated = chats.map((c) =>
      c.id === active.id ? { ...c, messages: [...c.messages, { from: "me" as const, text: body }], updatedAt: Date.now() } : c,
    )
    setChats(updated)
    saveChats(updated)
    setText("")
    setTyping(active.seller)
    window.setTimeout(() => {
      const reply = AUTO_REPLIES[replyIdx.current % AUTO_REPLIES.length]
      replyIdx.current += 1
      setChats((prev) => {
        const next = prev.map((c) =>
          c.id === active.id ? { ...c, messages: [...c.messages, { from: "them" as const, text: reply }], updatedAt: Date.now() } : c,
        )
        saveChats(next)
        return next
      })
      setTyping(null)
    }, 1200)
  }

  const sellerPicks = useMemo(
    () => ({
      "Maya K.": "bg-amber",
      "Diego R.": "bg-moss",
      "Aisha B.": "bg-forest",
      "Tom W.": "bg-amber-deep",
      You: "bg-forest",
    }),
    [],
  )

  const avatarCls = (seller: string) => (sellerPicks as Record<string, string>)[seller] ?? "bg-forest"

  if (active) {
    return (
      <div className="flex h-[calc(100dvh-8.5rem)] flex-col">
        <div className="flex items-center gap-3 border-b border-mist/70 bg-paper/95 px-5 py-4 backdrop-blur-sm">
          <button onClick={closeThread} className="text-ink-soft transition hover:text-ink" aria-label="Back to inbox">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-forest-deep ${avatarCls(active.seller)}`}>
            {active.seller
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">{active.seller}</p>
            <p className="line-clamp-1 text-[11px] text-ink-soft">{active.bookTitle}</p>
          </div>
          {active.verified && <span className="rounded-full bg-forest px-2.5 py-1 text-[10px] font-bold text-amber">Verified ✓</span>}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
          {active.messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  m.from === "me" ? "rounded-br-md bg-forest text-paper" : "rounded-bl-md bg-mist text-ink"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-mist px-4 py-3 shadow-sm">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                    className="h-1.5 w-1.5 rounded-full bg-ink-soft"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="border-t border-mist/70 bg-paper px-4 pt-3 pb-6">
          <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-forest/30 bg-forest/5 px-3 py-1.5 text-[11px] font-semibold text-forest transition hover:bg-forest hover:text-paper"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Write a message…"
              className="flex-1 rounded-full border border-mist bg-mist/40 px-4 py-3 text-sm outline-none placeholder:text-ink-soft/70 focus:border-forest"
            />
            <button
              onClick={() => send()}
              disabled={!text.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-paper shadow-md shadow-forest/30 transition enabled:hover:bg-forest-light enabled:active:scale-90 disabled:opacity-40"
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md px-6">
      <div className="pt-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          In<span className="text-amber-deep">box</span>
        </h1>
        <p className="text-sm text-ink-soft">Your book conversations</p>
      </div>

      {chats.length === 0 ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 150, damping: 14 }} className="text-5xl">
            💬
          </motion.div>
          <h2 className="font-display mt-4 text-xl font-semibold text-ink">No messages yet</h2>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Reserve a book and your conversation with the seller will start right here.
          </p>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-6 rounded-full bg-forest px-8 py-3.5 font-semibold text-paper shadow-lg shadow-forest/30 transition hover:scale-[1.03] hover:bg-forest-light active:scale-95"
          >
            Browse the Marketplace
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {chats.map((chat) => (
              <motion.button
                key={chat.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => openThread(chat.id)}
                className="flex items-center gap-3 rounded-2xl border border-mist bg-paper p-3 text-left shadow-sm transition hover:border-forest hover:shadow-md"
              >
                <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black text-forest-deep ${avatarCls(chat.seller)}`}>
                  {chat.seller
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                  {chat.unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber text-[10px] font-black text-forest-deep ring-2 ring-paper">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ink">{chat.seller}</p>
                    <span className="shrink-0 text-[10px] font-medium text-ink-soft">{relativeTime(chat.updatedAt)}</span>
                  </div>
                  <p className="line-clamp-1 text-xs text-ink-soft">
                    <span className="font-semibold text-forest">📚 {chat.bookTitle}</span>
                    {chat.messages.length > 0 && ` · ${chat.messages[chat.messages.length - 1].from === "me" ? "You: " : ""}${chat.messages[chat.messages.length - 1].text}`}
                  </p>
                </div>
                {chat.unread > 0 && <span className="shrink-0 text-base text-amber">●</span>}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
