import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { PageLoader } from "./components/PageLoader"

const Welcome = lazy(() => import("./screens/Welcome").then((m) => ({ default: m.Welcome })))
const Quiz = lazy(() => import("./screens/Quiz").then((m) => ({ default: m.Quiz })))
const QuizResult = lazy(() => import("./screens/QuizResult").then((m) => ({ default: m.QuizResult })))
const BookDNA = lazy(() => import("./screens/BookDNA").then((m) => ({ default: m.BookDNA })))
const Home = lazy(() => import("./screens/Home").then((m) => ({ default: m.Home })))
const Swipe = lazy(() => import("./screens/Swipe").then((m) => ({ default: m.Swipe })))
const Marketplace = lazy(() => import("./screens/Marketplace").then((m) => ({ default: m.Marketplace })))
const Messages = lazy(() => import("./screens/Messages").then((m) => ({ default: m.Messages })))
const Sell = lazy(() => import("./screens/Sell").then((m) => ({ default: m.Sell })))
const Profile = lazy(() => import("./screens/Profile").then((m) => ({ default: m.Profile })))
const BookDetailsPage = lazy(() => import("./screens/BookDetailsPage").then((m) => ({ default: m.BookDetailsPage })))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result" element={<QuizResult />} />
          <Route path="/dna" element={<BookDNA />} />
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/swipe" element={<Swipe />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/book/:id" element={<BookDetailsPage />} />
          <Route path="*" element={<Welcome />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
