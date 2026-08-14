import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import { totalUnread } from "../lib/chats"

const items = [
  { to: "/home", label: "Home", icon: "M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5" },
  { to: "/swipe", label: "Swipe", icon: "M4 6h10M4 12h7M4 18h10M16 8l5 5-5 5" },
  { to: "/marketplace", label: "Marketplace", icon: "M3 9l1.5-5h15L21 9M3 9v9a2 2 0 002 2h14a2 2 0 002-2V9M3 9h18M8 21v-6a3 3 0 016 0v6" },
  { to: "/messages", label: "Inbox", icon: "M4 4h16v12H8l-4 4z" },
  { to: "/sell", label: "Sell", icon: "M12 5v14M5 12h14" },
  { to: "/profile", label: "Profile", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" },
]

export function BottomNav() {
  const [unread, setUnread] = useState(totalUnread())

  useEffect(() => {
    const update = () => setUnread(totalUnread())
    window.addEventListener("bookloop:unread", update)
    return () => window.removeEventListener("bookloop:unread", update)
  }, [])

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-4">
      <div className="flex items-center justify-between rounded-3xl border border-mist bg-paper/90 px-2 py-2 shadow-[0_-4px_30px_rgba(46,42,36,0.12)] backdrop-blur-lg">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex min-w-12 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 transition-all duration-200 ${
                isActive ? "bg-forest text-paper shadow-lg shadow-forest/30" : "text-ink-soft hover:bg-mist/60"
              }`
            }
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap">{item.label}</span>
            {item.to === "/messages" && unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[9px] font-black text-forest-deep ring-2 ring-paper">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
