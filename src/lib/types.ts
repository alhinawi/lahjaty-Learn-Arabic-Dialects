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
