import type { AudioIndex, Content, VoicesManifest } from './types'

const PHRASE_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/
const DIALECT_ID = /^[a-z0-9_-]+$/

/** Returns a list of problems. An empty list means the content is valid. */
export function validateContent(content: Content, voices?: VoicesManifest): string[] {
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
        if (!phraseIds.has(pid)) errors.push(`voices.phrases.${d}: unknown phrase "${pid}"`)
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

export function missingAudio(content: Content, index: AudioIndex): MissingAudioRow[] {
  return content.dialects.map((d) => {
    const have = new Set(index[d.id] ?? [])
    const missing = content.phrases.filter((p) => !have.has(p.id)).map((p) => p.id)
    return { dialectId: d.id, have: content.phrases.length - missing.length, total: content.phrases.length, missing }
  })
}
