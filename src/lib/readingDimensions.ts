/**
 * Reading Dimensions — the underlying language of taste.
 *
 * Every reader has a hidden profile across these 20 dimensions (0–100 each).
 * Users never see this name or these numbers directly; the friendly Book DNA
 * personality is only a summary of it. Internally this vector is called the
 * Reader Genome.
 */

export type DimensionId =
  | "mystery"
  | "fantasy"
  | "scifi"
  | "romance"
  | "adventure"
  | "thriller"
  | "historical"
  | "biography"
  | "literary"
  | "philosophy"
  | "worldBuilding"
  | "characterDriven"
  | "plotTwists"
  | "fastPace"
  | "emotional"
  | "humor"
  | "darkThemes"
  | "educational"
  | "cozy"
  | "complex"

export const READING_DIMENSIONS = [
  { id: "mystery", label: "Mystery", emoji: "🔍" },
  { id: "fantasy", label: "Fantasy", emoji: "🏰" },
  { id: "scifi", label: "Sci-Fi", emoji: "🚀" },
  { id: "romance", label: "Romance", emoji: "❤️" },
  { id: "adventure", label: "Adventure", emoji: "🧭" },
  { id: "thriller", label: "Thriller", emoji: "🕵️" },
  { id: "historical", label: "Historical", emoji: "🏛️" },
  { id: "biography", label: "Biography", emoji: "📖" },
  { id: "literary", label: "Literary", emoji: "✒️" },
  { id: "philosophy", label: "Philosophy", emoji: "🧠" },
  { id: "worldBuilding", label: "World Building", emoji: "🌍" },
  { id: "characterDriven", label: "Character Driven", emoji: "💛" },
  { id: "plotTwists", label: "Plot Twists", emoji: "🌀" },
  { id: "fastPace", label: "Fast Pace", emoji: "⚡" },
  { id: "emotional", label: "Emotional", emoji: "💫" },
  { id: "humor", label: "Humor", emoji: "😄" },
  { id: "darkThemes", label: "Dark Themes", emoji: "🌑" },
  { id: "educational", label: "Educational", emoji: "🎓" },
  { id: "cozy", label: "Cozy", emoji: "🧸" },
  { id: "complex", label: "Complex", emoji: "🧩" },
] as const

export type ReaderGenome = Record<DimensionId, number>

export const DIMENSION_IDS: DimensionId[] = READING_DIMENSIONS.map((d) => d.id)

export function emptyGenome(): ReaderGenome {
  const g = {} as ReaderGenome
  for (const d of DIMENSION_IDS) g[d] = 0
  return g
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/** Fills in every dimension (unspecified dims default to 0, values clamped to 0–100). */
export function fullGenome(partial: Partial<ReaderGenome>): ReaderGenome {
  const g = emptyGenome()
  for (const d of DIMENSION_IDS) g[d] = clamp(Math.round(partial[d] ?? 0), 0, 100)
  return g
}

/** Scales a raw accumulation map so the strongest dimension is 100. */
export function normalizeGenome(raw: Partial<ReaderGenome>): ReaderGenome {
  const values = DIMENSION_IDS.map((d) => raw[d] ?? 0)
  const max = Math.max(...values, 0)
  if (max <= 0) return emptyGenome()
  const g = emptyGenome()
  for (const d of DIMENSION_IDS) g[d] = Math.round(((raw[d] ?? 0) / max) * 100)
  return g
}

export function hasAnySignal(genome: ReaderGenome): boolean {
  return DIMENSION_IDS.some((d) => genome[d] > 0)
}

/**
 * Maps the legacy quiz tags onto the 20 reading dimensions.
 * Kept so old saved quizzes (and any book tagged the old way) still feed
 * the engine — this is the backward-compatibility bridge.
 */
export const TAG_TO_DIMENSIONS: Record<string, Partial<ReaderGenome>> = {
  fantasy: { fantasy: 85, worldBuilding: 75, adventure: 55, emotional: 20, humor: 10, cozy: 10 },
  escapist: { adventure: 60, worldBuilding: 50, fantasy: 35, scifi: 35, fastPace: 30, complex: 10 },
  scifi: { scifi: 85, philosophy: 55, worldBuilding: 55, complex: 45, fastPace: 25, adventure: 25 },
  sleuth: { mystery: 55, plotTwists: 70, thriller: 60, fastPace: 55, characterDriven: 30, darkThemes: 25 },
  mystery: { mystery: 85, plotTwists: 75, thriller: 65, darkThemes: 40, characterDriven: 35, fastPace: 30 },
  heart: { characterDriven: 80, emotional: 80, romance: 50, cozy: 30, humor: 15, literary: 15 },
  literary: { literary: 80, characterDriven: 45, emotional: 45, philosophy: 45, complex: 50, historical: 20 },
  thinker: { philosophy: 80, complex: 75, educational: 50, literary: 45, historical: 25, biography: 20 },
  cozy: { cozy: 85, emotional: 45, humor: 40, characterDriven: 35, romance: 25, adventure: 10 },
}

/** Builds a full genome from a list of legacy tags (e.g. a quiz answer's tags). */
export function genomeFromTags(tags: readonly string[]): ReaderGenome {
  const raw: Partial<ReaderGenome> = {}
  for (const tag of tags) {
    const boost = TAG_TO_DIMENSIONS[tag]
    if (!boost) continue
    for (const dim of DIMENSION_IDS) {
      const v = boost[dim]
      if (v) raw[dim] = (raw[dim] ?? 0) + v
    }
  }
  return normalizeGenome(raw)
}

/**
 * Default genomes for users who haven't expressed taste yet.
 * Explorer = balanced across everything; cozy = the friendly default the app
 * has always shown for brand-new readers with no quiz.
 */
export const DEFAULT_GENOMES = {
  explorer: (() => {
    const g = emptyGenome()
    for (const d of DIMENSION_IDS) g[d] = 55
    return g
  })(),
  cozy: (() => {
    const g = emptyGenome()
    for (const d of DIMENSION_IDS) g[d] = 45
    g.cozy = 75
    g.emotional = 60
    g.characterDriven = 55
    g.humor = 50
    g.romance = 45
    return g
  })(),
} as const

/**
 * Builds the Reader Genome from a saved quiz (array of tag-arrays, one per
 * answered question). Empty input falls back to the cozy default genome.
 */
export function buildGenomeFromAnswers(answers: readonly (readonly string[])[]): ReaderGenome {
  const tags = answers.flat()
  const genome = genomeFromTags(tags)
  if (!hasAnySignal(genome)) return { ...DEFAULT_GENOMES.cozy }
  return genome
}

/** Resolves a book's reading profile: explicit metadata wins, legacy tags are the fallback. */
export function bookDimensionsOf(book: { dimensions?: Partial<ReaderGenome>; tags: readonly string[] }): ReaderGenome {
  if (book.dimensions && Object.keys(book.dimensions).length > 0) {
    return fullGenome(book.dimensions)
  }
  return genomeFromTags(book.tags)
}
