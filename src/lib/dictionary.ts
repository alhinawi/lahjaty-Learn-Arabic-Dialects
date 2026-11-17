import { useEffect, useState } from 'react'
import rawIndex from '../content/dictionary/index.json'
import { dialects, getDialect, STANDARD_ID } from './content'
import { normalize } from './search'
import type { DictEntry, DictIndex, DictTopic } from './types'
import { dictAudioId } from './validate'

export { dictAudioId }

export const dictIndex = rawIndex as DictIndex
export const dictTopics: DictTopic[] = dictIndex.topics
const topicById = new Map(dictTopics.map((t) => [t.id, t]))
export const getTopic = (id: string | undefined) => (id ? topicById.get(id) : undefined)
export const topicOf = (entryId: string) => entryId.split('.')[0]

import { topicLoaders } from './dictionaryLoaders'

const loaderFor = (id: string) => topicLoaders[id]

const cache = new Map<string, DictEntry[]>()
const inflight = new Map<string, Promise<DictEntry[]>>()

export function loadTopic(id: string): Promise<DictEntry[]> {
  const hit = cache.get(id)
  if (hit) return Promise.resolve(hit)
  const running = inflight.get(id)
  if (running) return running
  const load = loaderFor(id)
  if (!load) return Promise.resolve([])
  const p = load().then((f) => {
    cache.set(id, f.entries)
    inflight.delete(id)
    return f.entries
  })
  inflight.set(id, p)
  return p
}

export const loadAllTopics = () => Promise.all(dictTopics.map((t) => loadTopic(t.id))).then((lists) => lists.flat())

export function loadEntry(entryId: string): Promise<DictEntry | undefined> {
  return loadTopic(topicOf(entryId)).then((list) => list.find((e) => e.id === entryId))
}

/** Loads one topic; null while loading. A prerendered `initial` skips the fetch entirely. */
export function useTopic(id: string | undefined, initial?: DictEntry[]): DictEntry[] | null {
  const [asyncState, setAsyncState] = useState<{ id?: string; entries: DictEntry[] | null }>({ entries: null })
  useEffect(() => {
    let alive = true
    if (!id) return
    if (initial && !cache.has(id)) cache.set(id, initial)
    if (cache.has(id)) return
    loadTopic(id).then((entries) => alive && setAsyncState({ id, entries }))
    return () => {
      alive = false
    }
  }, [id, initial])
  if (!id) return []
  const hit = cache.get(id)
  if (hit) return hit
  if (asyncState.id === id) return asyncState.entries
  return initial ?? null
}

/** Loads every topic once `enabled` is true; null until then. */
export function useAllEntries(enabled = true): DictEntry[] | null {
  const ready = () => (dictTopics.every((t) => cache.has(t.id)) ? dictTopics.flatMap((t) => cache.get(t.id)!) : null)
  const [entries, setEntries] = useState<DictEntry[] | null>(ready)
  useEffect(() => {
    let alive = true
    if (enabled && !entries) loadAllTopics().then((list) => alive && setEntries(list))
    return () => {
      alive = false
    }
  }, [enabled, entries])
  return entries
}

export function useEntry(entryId: string | undefined, initial?: DictEntry): DictEntry | null | undefined {
  const list = useTopic(entryId ? topicOf(entryId) : undefined, initial ? [initial] : undefined)
  if (!entryId) return undefined
  if (list === null) return null
  return list.find((e) => e.id === entryId)
}

/** The word(s) for a dialect; Standard Arabic reads the fs field. */
export const wordIn = (e: DictEntry, dialectId: string) => (dialectId === STANDARD_ID ? e.fs : e.words[dialectId])

export const splitWords = (w: string) => w.split('/').map((x) => x.trim()).filter(Boolean)

/** Other dialects that use one of the same words as this dialect, in dialect order. */
export function sameWordIn(e: DictEntry, dialectId: string): string[] {
  const mine = wordIn(e, dialectId)
  if (!mine) return []
  const set = new Set(splitWords(mine).map(normalize))
  return dialects
    .filter((d) => d.id !== dialectId && d.id !== STANDARD_ID)
    .filter((d) => {
      const w = e.words[d.id]
      return !!w && splitWords(w).some((x) => set.has(normalize(x)))
    })
    .map((d) => d.id)
}

/** Dialect rows for the "word in every dialect" view, grouping dialects that say exactly the same thing. */
export function dialectsWithWord(e: DictEntry): string[] {
  return dialects.filter((d) => d.id !== STANDARD_ID && e.words[d.id]).map((d) => d.id)
}

export interface DictHit {
  entry: DictEntry
  score: number
  matched: string
  dialectId?: string
}

function scoreField(field: string, q: string): number {
  if (!field) return 0
  if (field === q) return 100
  const padded = ` ${field} `
  if (padded.includes(` ${q} `)) return 75
  if (field.startsWith(q)) return 65
  if (padded.includes(` ${q}`)) return 55
  if (q.length >= 3 && field.includes(q)) return 40
  return 0
}

const docs = new WeakMap<DictEntry[], { entry: DictEntry; fields: [string, string, string | undefined][] }[]>()

/** Searches dictionary words in every dialect, Standard Arabic and English. */
export function searchDictionary(entries: DictEntry[], query: string, limit = 12): DictHit[] {
  const q = normalize(query)
  if (!q) return []
  let list = docs.get(entries)
  if (!list) {
    list = entries.map((entry) => {
      const fields: [string, string, string | undefined][] = [
        [normalize(entry.fs), entry.fs, undefined],
        ...entry.en.split(/[,;(]/).map((x) => [normalize(x), entry.en, undefined] as [string, string, undefined]),
      ]
      for (const [d, w] of Object.entries(entry.words)) for (const x of splitWords(w)) fields.push([normalize(x), x, d])
      return { entry, fields }
    })
    docs.set(entries, list)
  }
  const hits: DictHit[] = []
  for (const { entry, fields } of list) {
    let best = 0
    let matched = ''
    let dialectId: string | undefined
    for (const [norm, orig, d] of fields) {
      const s = scoreField(norm, q) - norm.length / 400
      if (s > best) {
        best = s
        matched = orig
        dialectId = d
      }
    }
    if (best > 0) hits.push({ entry, score: best, matched, dialectId })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

/** A word for today, the same for everyone on the same local day. */
export function wordOfTheDayIndex(day: number, total: number) {
  return total ? (day * 7907) % total : 0
}

export const dialectName = (id: string, lang: 'ar' | 'en') => {
  const d = getDialect(id)
  return d ? (lang === 'ar' ? d.name : d.nameEn) : id
}
