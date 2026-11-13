import type { AudioIndex, Content, FamousContent, VoicesManifest } from './types'

const PHRASE_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/
const DIALECT_ID = /^[a-z0-9_-]+$/
const FAMOUS_ID = /^famous\.[a-z0-9_]+$/
const WORD_GROUPS = new Set(['egypt', 'sudan', 'levant', 'iraq', 'gulf', 'yemen', 'maghreb'])

/** Returns a list of problems. An empty list means the content is valid. */
export function validateContent(content: Content, voices?: VoicesManifest, famous?: FamousContent): string[] {
  const errors: string[] = []
  const regionIds = new Set(content.regions.map((r) => r.id))
  const dialectIds = new Set<string>()
  for (const d of content.dialects) {
    if (!DIALECT_ID.test(d.id)) errors.push(`dialect "${d.id}": id must be lowercase letters, digits, _ or -`)
    if (dialectIds.has(d.id)) errors.push(`dialect "${d.id}": duplicate id`)
    dialectIds.add(d.id)
    if (!regionIds.has(d.region)) errors.push(`dialect "${d.id}": unknown region "${d.region}"`)
    if (!d.name || !d.nameEn) errors.push(`dialect "${d.id}": name and nameEn are required`)
  }

  const categoryIds = new Set<string>()
  for (const c of content.categories) {
    if (categoryIds.has(c.id)) errors.push(`category "${c.id}": duplicate id`)
    categoryIds.add(c.id)
  }

  const phraseIds = new Set<string>()
  for (const p of content.phrases) {
    if (!PHRASE_ID.test(p.id)) errors.push(`phrase "${p.id}": id must look like "category.slug"`)
    if (phraseIds.has(p.id)) errors.push(`phrase "${p.id}": duplicate id`)
    phraseIds.add(p.id)
    if (!categoryIds.has(p.category)) errors.push(`phrase "${p.id}": unknown category "${p.category}"`)
    if (p.id.split('.')[0] !== p.category) errors.push(`phrase "${p.id}": id must start with its category`)
    if (!p.english?.trim()) errors.push(`phrase "${p.id}": english meaning is required`)
    for (const d of dialectIds) {
      if (!p.variants[d]?.text?.trim()) errors.push(`phrase "${p.id}": missing text for dialect "${d}"`)
    }
    for (const key of Object.keys(p.variants)) {
      if (!dialectIds.has(key)) errors.push(`phrase "${p.id}": variant for unknown dialect "${key}"`)
    }
  }

  const famousIds = new Map<string, Set<string>>()
  if (famous) {
    const conceptIds = new Set<string>()
    for (const c of famous.concepts) {
      if (conceptIds.has(c.id)) errors.push(`concept "${c.id}": duplicate id`)
      conceptIds.add(c.id)
      if (!c.name?.trim() || !c.nameEn?.trim()) errors.push(`concept "${c.id}": name and nameEn are required`)
      if (c.base && !phraseIds.has(c.base)) errors.push(`concept "${c.id}": unknown base phrase "${c.base}"`)
      for (const g of Object.keys(c.words ?? {})) {
        if (!WORD_GROUPS.has(g)) errors.push(`concept "${c.id}": unknown word group "${g}"`)
      }
    }
    for (const d of dialectIds) {
      if (!famous.dialects[d]?.length) errors.push(`famous: dialect "${d}" has no famous phrases`)
    }
    for (const [d, list] of Object.entries(famous.dialects)) {
      if (!dialectIds.has(d)) errors.push(`famous: unknown dialect "${d}"`)
      const ids = new Set<string>()
      for (const f of list) {
        const where = `famous.${d}: "${f.id}"`
        if (!FAMOUS_ID.test(f.id)) errors.push(`${where}: id must look like "famous.slug"`)
        if (ids.has(f.id)) errors.push(`${where}: duplicate id`)
        ids.add(f.id)
        if (!f.text?.trim()) errors.push(`${where}: text is required`)
        if (!f.english?.trim()) errors.push(`${where}: english meaning is required`)
        if (!f.standard?.trim()) errors.push(`${where}: standard meaning is required`)
        if (f.concept && !conceptIds.has(f.concept)) errors.push(`${where}: unknown concept "${f.concept}"`)
      }
      famousIds.set(d, ids)
    }
  }

  if (voices) {
    const voiceIds = new Set<string>()
    for (const v of voices.voices) {
      if (voiceIds.has(v.id)) errors.push(`voice "${v.id}": duplicate id`)
      voiceIds.add(v.id)
      if (!dialectIds.has(v.dialect)) errors.push(`voice "${v.id}": unknown dialect "${v.dialect}"`)
      if (v.gender !== 'male' && v.gender !== 'female') errors.push(`voice "${v.id}": gender must be male or female`)
    }
    for (const [d, voiceId] of Object.entries(voices.defaults)) {
      if (!dialectIds.has(d)) errors.push(`voices.defaults: unknown dialect "${d}"`)
      if (!voiceIds.has(voiceId)) errors.push(`voices.defaults.${d}: unknown voice "${voiceId}"`)
    }
    for (const [d, map] of Object.entries(voices.phrases)) {
      if (!dialectIds.has(d)) errors.push(`voices.phrases: unknown dialect "${d}"`)
      for (const [pid, voiceId] of Object.entries(map)) {
        if (!phraseIds.has(pid) && !famousIds.get(d)?.has(pid)) errors.push(`voices.phrases.${d}: unknown phrase "${pid}"`)
        if (!voiceIds.has(voiceId)) errors.push(`voices.phrases.${d}.${pid}: unknown voice "${voiceId}"`)
      }
    }
  }
  return errors
}

export interface MissingAudioRow {
  dialectId: string
  have: number
  total: number
  missing: string[]
}

/** Every phrase id that can have audio in a dialect: the everyday phrases, then its famous phrases. */
export function audioPhraseIds(content: Content, dialectId: string, famous?: FamousContent): string[] {
  return [...content.phrases.map((p) => p.id), ...(famous?.dialects[dialectId] ?? []).map((f) => f.id)]
}

export function missingAudio(content: Content, index: AudioIndex, famous?: FamousContent): MissingAudioRow[] {
  return content.dialects.map((d) => {
    const have = new Set(index[d.id] ?? [])
    const all = audioPhraseIds(content, d.id, famous)
    const missing = all.filter((id) => !have.has(id))
    return { dialectId: d.id, have: all.length - missing.length, total: all.length, missing }
  })
}
