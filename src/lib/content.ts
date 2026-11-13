import rawContent from '../content/phrases.json'
import rawVoices from '../content/voices.json'
import rawAudioIndex from '../generated/audio-index.json'
import type { AudioIndex, Category, Content, Dialect, Phrase, Region, Voice, VoicesManifest } from './types'

export const content = rawContent as Content
export const voicesManifest = rawVoices as VoicesManifest
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
