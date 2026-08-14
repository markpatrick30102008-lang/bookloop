import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function Layout() {
  return (
    <div className="min-h-dvh bg-paper">
      <main className="pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
