import type { AudioIndex, Content, DictEntry, DictIndex, DictTopicFile, FamousContent, VoicesManifest } from './types'

import { validateNoteSources } from './noteSources'

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
        errors.push(...validateNoteSources(f).map((e) => `${where}: ${e}`))
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
export function audioPhraseIds(content: Content, dialectId: string, famous?: FamousContent, dictionary?: DictEntry[]): string[] {
  return [
    ...content.phrases.map((p) => p.id),
    ...(famous?.dialects[dialectId] ?? []).map((f) => f.id),
    ...(dictionary ? dictAudioIds(dictionary, dialectId) : []),
  ]
}

export function missingAudio(content: Content, index: AudioIndex, famous?: FamousContent, dictionary?: DictEntry[]): MissingAudioRow[] {
  return content.dialects.map((d) => {
    const have = new Set(index[d.id] ?? [])
    const all = audioPhraseIds(content, d.id, famous, dictionary)
    const missing = all.filter((id) => !have.has(id))
    return { dialectId: d.id, have: all.length - missing.length, total: all.length, missing }
  })
}

// ---------- dictionary ----------

const DICT_ENTRY_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/
const POS = new Set(['n', 'v', 'adj', 'adv', 'pron', 'q', 'int', 'num', 'phr', 'conj', 'prep'])

/** The audio id of a dictionary word: public/audio/<dialectId>/dict.<entryId>.mp3 */
export const dictAudioId = (entryId: string) => `dict.${entryId}`

/** Checks the dictionary index and its topic files. An empty list means it is valid. */
export function validateDictionary(content: Content, index: DictIndex, files: DictTopicFile[]): string[] {
  const errors: string[] = []
  const dialectIds = new Set(content.dialects.map((d) => d.id))
  const topicIds = new Set<string>()
  for (const t of index.topics) {
    if (!/^[a-z0-9_]+$/.test(t.id)) errors.push(`dictionary topic "${t.id}": bad id`)
    if (topicIds.has(t.id)) errors.push(`dictionary topic "${t.id}": duplicate id`)
    topicIds.add(t.id)
    if (!t.name?.trim() || !t.nameEn?.trim()) errors.push(`dictionary topic "${t.id}": name and nameEn are required`)
    if (!files.some((f) => f.id === t.id)) errors.push(`dictionary topic "${t.id}": no file src/content/dictionary/${t.id}.json`)
  }
  const entryIds = new Set<string>()
  for (const f of files) {
    if (!topicIds.has(f.id)) errors.push(`dictionary file "${f.id}.json": topic is not in index.json`)
    if (!f.entries.length) errors.push(`dictionary topic "${f.id}": no entries`)
    for (const e of f.entries) {
      const where = `dictionary "${e.id}"`
      if (!DICT_ENTRY_ID.test(e.id) || e.id.split('.')[0] !== f.id) errors.push(`${where}: id must look like "${f.id}.slug"`)
      if (entryIds.has(e.id)) errors.push(`${where}: duplicate id`)
      entryIds.add(e.id)
      if (!e.fs?.trim() || !e.en?.trim()) errors.push(`${where}: fs and en are required`)
      if (!POS.has(e.pos)) errors.push(`${where}: unknown part of speech "${e.pos}"`)
      for (const [d, w] of Object.entries(e.words)) {
        if (!dialectIds.has(d) || d === 'fs') errors.push(`${where}: word for unknown dialect "${d}"`)
        if (!w?.trim()) errors.push(`${where}: empty word for "${d}"`)
      }
      for (const d of Object.keys(e.ex ?? {})) {
        if (d !== 'fs' && !e.words[d]) errors.push(`${where}: example for "${d}" without a word`)
      }
    }
  }
  return errors
}

/** Dictionary words that can have audio in a dialect: every word written for it (Standard Arabic: all of them). */
export function dictAudioIds(entries: DictEntry[], dialectId: string): string[] {
  return entries.filter((e) => dialectId === 'fs' || e.words[dialectId]).map((e) => dictAudioId(e.id))
}
