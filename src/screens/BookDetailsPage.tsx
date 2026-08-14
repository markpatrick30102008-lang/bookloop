import { useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { resolveCard } from "../lib/resolveBook"
import { BookDetails } from "./BookDetails"

export function BookDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const card = useMemo(() => resolveCard(id), [id])

  useEffect(() => {
    if (!card) navigate("/marketplace", { replace: true })
  }, [card, navigate])

  if (!card) return null
  return <BookDetails card={card} onBack={() => navigate(-1)} />
}
