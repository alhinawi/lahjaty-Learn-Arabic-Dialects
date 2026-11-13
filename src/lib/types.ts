export type RegionId = 'standard' | 'nile' | 'levant' | 'iraq' | 'gulf' | 'yemen' | 'maghreb'

export interface Region {
  id: RegionId
  name: string
  nameEn: string
}

export interface Dialect {
  /** Stable id. Used in URLs and audio paths: public/audio/<id>/... */
  id: string
  name: string
  nameEn: string
  country: string
  countryEn: string
  region: RegionId
  /** Where the dialect is centred, for the map. */
  lat?: number
  lon?: number
}

export interface Category {
  id: string
  name: string
  nameEn: string
}

export interface Variant {
  text: string
  /** Latin transliteration, optional. */
  translit?: string
}

export interface Phrase {
  /** Stable id, "<category>.<slug>". Used in audio paths. Never rename. */
  id: string
  category: string
  english: string
  note?: string
  noteAr?: string
  variants: Record<string, Variant>
}

export interface Content {
  version: number
  regions: Region[]
  dialects: Dialect[]
  categories: Category[]
  phrases: Phrase[]
}

export interface Voice {
  id: string
  name: string
  gender: 'male' | 'female'
  dialect: string
}

export interface VoicesManifest {
  voices: Voice[]
  /** dialectId -> voiceId used for every phrase of that dialect */
  defaults: Record<string, string>
  /** dialectId -> phraseId -> voiceId, overrides the default */
  phrases: Record<string, Record<string, string>>
}

/** dialectId -> phrase ids that have an audio file */
export type AudioIndex = Record<string, string[]>

/** The everyday-wording groups used for "meaning in your dialect" on famous phrases. */
export type WordGroup = 'egypt' | 'sudan' | 'levant' | 'iraq' | 'gulf' | 'yemen' | 'maghreb'

/** A meaning that famous phrases from different dialects share, e.g. "now" or "very". */
export interface Concept {
  id: string
  /** The meaning in Standard Arabic. */
  name: string
  nameEn: string
  /** An everyday phrase with the same meaning; its variant in the visitor's dialect is shown. */
  base?: string
  /** The everyday word for this meaning in each group, used when the visitor's dialect has no phrase for it. */
  words?: Partial<Record<WordGroup, string>>
}

export interface FamousPhrase {
  /** Stable id, "famous.<slug>", unique within its dialect. Used in audio paths. Never rename. */
  id: string
  text: string
  english: string
  /** The meaning in Standard Arabic. */
  standard: string
  noteAr?: string
  note?: string
  example?: string
  concept?: string
}

export interface FamousContent {
  version: number
  concepts: Concept[]
  /** dialectId -> its famous phrases, most iconic first */
  dialects: Record<string, FamousPhrase[]>
}
