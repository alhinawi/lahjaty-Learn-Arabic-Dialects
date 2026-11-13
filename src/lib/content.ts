import rawFamous from '../content/famous.json'
import rawContent from '../content/phrases.json'
import rawVoices from '../content/voices.json'
import rawAudioIndex from '../generated/audio-index.json'
import type {
  AudioIndex,
  Category,
  Concept,
  Content,
  Dialect,
  FamousContent,
  FamousPhrase,
  Phrase,
  Region,
  Voice,
  VoicesManifest,
  WordGroup,
} from './types'

export const content = rawContent as Content
export const voicesManifest = rawVoices as VoicesManifest
export const famousContent = rawFamous as FamousContent
const audioIndex = rawAudioIndex as AudioIndex

export const regions: Region[] = content.regions
export const dialects: Dialect[] = content.dialects
export const categories: Category[] = content.categories
export const phrases: Phrase[] = content.phrases

export const STANDARD_ID = 'fs'
export const DEFAULT_DIALECT = 'cai'

const dialectById = new Map(dialects.map((d) => [d.id, d]))
const categoryById = new Map(categories.map((c) => [c.id, c]))
const phraseById = new Map(phrases.map((p) => [p.id, p]))
const audioSets = new Map(Object.entries(audioIndex).map(([d, ids]) => [d, new Set(ids)]))
const voiceById = new Map(voicesManifest.voices.map((v) => [v.id, v]))

export const getDialect = (id: string | undefined) => (id ? dialectById.get(id) : undefined)
export const getCategory = (id: string | undefined) => (id ? categoryById.get(id) : undefined)
export const getPhrase = (id: string | undefined) => (id ? phraseById.get(id) : undefined)

export const phrasesInCategory = (categoryId: string) => phrases.filter((p) => p.category === categoryId)

export function dialectsByRegion(list: Dialect[] = dialects): { region: Region; dialects: Dialect[] }[] {
  return regions
    .map((region) => ({ region, dialects: list.filter((d) => d.region === region.id) }))
    .filter((g) => g.dialects.length > 0)
}

/** Strips Arabic diacritics and unifies alef forms so search is forgiving. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim()
}

export function searchDialects(query: string, list: Dialect[] = dialects): Dialect[] {
  const q = normalize(query)
  if (!q) return list
  return list.filter((d) =>
    [d.name, d.nameEn, d.country, d.countryEn, d.id].some((field) => normalize(field).includes(q)),
  )
}

export const hasAudio = (dialectId: string, phraseId: string) => audioSets.get(dialectId)?.has(phraseId) ?? false

export const audioUrl = (dialectId: string, phraseId: string) =>
  `/audio/${encodeURIComponent(dialectId)}/${encodeURIComponent(phraseId)}.mp3`

export const audioCount = (dialectId: string) => audioSets.get(dialectId)?.size ?? 0

export function voiceFor(dialectId: string, phraseId: string): Voice | undefined {
  const id = voicesManifest.phrases[dialectId]?.[phraseId] ?? voicesManifest.defaults[dialectId]
  return id ? voiceById.get(id) : undefined
}

// ---------- famous phrases ----------

export const concepts: Concept[] = famousContent.concepts
const conceptById = new Map(concepts.map((c) => [c.id, c]))
export const getConcept = (id: string | undefined) => (id ? conceptById.get(id) : undefined)

export const famousFor = (dialectId: string): FamousPhrase[] => famousContent.dialects[dialectId] ?? []
export const getFamous = (dialectId: string, id: string) => famousFor(dialectId).find((f) => f.id === id)
export const isFamousId = (id: string) => id.startsWith('famous.')

/** Every famous phrase of every dialect except Standard Arabic, in dialect order. */
export const allFamous: { dialectId: string; phrase: FamousPhrase }[] = dialects
  .filter((d) => d.id !== STANDARD_ID)
  .flatMap((d) => famousFor(d.id).map((phrase) => ({ dialectId: d.id, phrase })))

/** Famous phrases of different dialects that share a concept, for the compare view. */
export function famousByConcept(conceptId: string): { dialectId: string; phrase: FamousPhrase }[] {
  return dialects.flatMap((d) => famousFor(d.id).filter((f) => f.concept === conceptId).map((phrase) => ({ dialectId: d.id, phrase })))
}

export function wordGroup(d: Dialect | undefined): WordGroup | undefined {
  if (!d || d.region === 'standard') return undefined
  if (d.region === 'nile') return d.countryEn === 'Egypt' ? 'egypt' : 'sudan'
  return d.region
}

/** Days since 1970 on the visitor's own clock, so "today" changes at local midnight. */
export const localDay = (now = new Date()) => Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)

/** One famous phrase for today, spread across dialects from day to day. */
export function phraseOfTheDay(day = localDay()) {
  return allFamous[(day * 7919) % allFamous.length]
}

/** One famous phrase from each dialect, the order and picks rotating every day. */
export function famousStrip(day = localDay()) {
  const list = dialects.filter((d) => d.id !== STANDARD_ID && famousFor(d.id).length > 0)
  const start = (day * 5) % list.length
  return [...list.slice(start), ...list.slice(0, start)].map((d) => {
    const fam = famousFor(d.id)
    return { dialectId: d.id, phrase: fam[day % fam.length] }
  })
}
