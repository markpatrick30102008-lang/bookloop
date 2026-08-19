/**
 * Personality Mapper — the friendly face of the Reader Genome.
 *
 * The Book DNA personality ("The Escapist", "The Cozy Wanderer"…) is no longer
 * a scoring input. It is a summary derived from the reader's hidden genome:
 * the engine scores books from the genome, and the personality is just the
 * archetype whose signature profile sits closest to that genome.
 */
import { READING_DIMENSIONS, buildGenomeFromAnswers, genomeFromTags, type ReaderGenome } from "./readingDimensions"

export type Archetype = {
  id: string
  name: string
  emoji: string
  blurb: string
  traits: string[]
  tags: string[]
}

export const ARCHETYPES: Record<string, Archetype> = {
  escapist: {
    id: "escapist",
    name: "The Escapist",
    emoji: "🌌",
    blurb: "You read to visit worlds that don't exist yet. Give you a door to somewhere else and you're gone for days.",
    traits: ["World-builder", "Series lover", "Imagination 100"],
    tags: ["fantasy", "scifi", "escapist"],
  },
  sleuth: {
    id: "sleuth",
    name: "The Sleuth",
    emoji: "🕵️",
    blurb: "You don't just read mysteries — you solve them three chapters early. Twists are your love language.",
    traits: ["Sharp-eyed", "Can't stop at one chapter", "Twist-spotter"],
    tags: ["mystery", "sleuth"],
  },
  heart: {
    id: "heart",
    name: "The Heart Reader",
    emoji: "❤️",
    blurb: "You read for the people. Characters feel like friends, and you collect books that make you feel seen.",
    traits: ["Empathetic", "Book-friend maker", "Flaming romantic"],
    tags: ["heart", "cozy"],
  },
  thinker: {
    id: "thinker",
    name: "The Deep Thinker",
    emoji: "🧠",
    blurb: "You want books that argue with you. The best ones stay with you for weeks, rearranging how you see things.",
    traits: ["Curious", "Marginalia writer", "Big-question chaser"],
    tags: ["thinker", "literary"],
  },
  cozy: {
    id: "cozy",
    name: "The Cozy Wanderer",
    emoji: "🧶",
    blurb: "You read to recharge. A warm book, a soft blanket, and a story that feels like a hug — that's your happy place.",
    traits: ["Comfort-seeker", "Rereader", "Tea-in-hand"],
    tags: ["cozy", "heart"],
  },
  explorer: {
    id: "explorer",
    name: "The Explorer",
    emoji: "🧭",
    blurb: "You're keeping every door open. Until your Book DNA arrives, we're surfacing a balanced mix across all genres.",
    traits: ["Open to everything", "Genre-hopper", "Taste explorer"],
    tags: ["fantasy", "scifi", "mystery", "heart", "cozy", "thinker"],
  },
}

export const ARCHETYPE_ORDER = ["escapist", "sleuth", "heart", "thinker", "cozy"]

/** Each archetype's signature genome, derived from its legacy tags. */
const ARCHETYPE_SIGNATURES: Record<string, ReaderGenome> = Object.fromEntries(
  [...ARCHETYPE_ORDER, "explorer"].map((id) => [id, genomeFromTags(ARCHETYPES[id].tags)]),
) as Record<string, ReaderGenome>

function cosineSimilarity(a: ReaderGenome, b: ReaderGenome): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (const d of READING_DIMENSIONS) {
    const x = a[d.id]
    const y = b[d.id]
    dot += x * y
    na += x * x
    nb += y * y
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

/** The archetype whose signature sits closest to this genome. */
export function personalityFromGenome(genome: ReaderGenome): Archetype {
  let best: Archetype = ARCHETYPES.cozy
  let bestScore = -1
  for (const id of [...ARCHETYPE_ORDER, "explorer"]) {
    const score = cosineSimilarity(genome, ARCHETYPE_SIGNATURES[id])
    if (score > bestScore) {
      bestScore = score
      best = ARCHETYPES[id]
    }
  }
  return best
}

/** Legacy quiz scorer — now just: genome from answers → closest personality. */
export function scoreQuiz(answers: readonly (readonly string[])[]): Archetype {
  if (answers.length === 0) return ARCHETYPES.cozy
  return personalityFromGenome(buildGenomeFromAnswers(answers))
}
