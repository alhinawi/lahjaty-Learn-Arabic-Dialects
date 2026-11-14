import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { content } from './content'
import { dictTopics, sameWordIn, searchDictionary } from './dictionary'
import { ogImageFor } from './og'
import type { DictEntry, DictTopicFile } from './types'
import { dictAudioId, missingAudio, validateDictionary } from './validate'

const dir = join(__dirname, '..', 'content', 'dictionary')
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.json') && f !== 'index.json')
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as DictTopicFile)
const entries = files.flatMap((f) => f.entries)

describe('dictionary', () => {
  it('is valid', () => {
    expect(validateDictionary(content, { version: 1, topics: dictTopics }, files)).toEqual([])
  })

  it('has a file for every topic and words in every topic', () => {
    for (const t of dictTopics) expect(files.find((f) => f.id === t.id)?.entries.length).toBeGreaterThan(0)
  })

  it('finds a word by any dialect, Standard Arabic or English', () => {
    const e = entries[0]
    const [dialectId, word] = Object.entries(e.words)[0]
    expect(searchDictionary(entries, e.fs)[0].entry.id).toBe(e.id)
    expect(searchDictionary(entries, e.en.split(/[,;(]/)[0]).map((h) => h.entry.id)).toContain(e.id)
    expect(searchDictionary(entries, word.split('/')[0]).some((h) => h.entry.id === e.id && (h.dialectId === dialectId || h.dialectId))).toBe(true)
  })

  it('lists dialects that share a word, never the dialect itself', () => {
    const e: DictEntry = { id: 'x.y', fs: 'أ', en: 'a', pos: 'n', words: { cai: 'كده / كدا', alx: 'كدا', dam: 'هيك' } }
    expect(sameWordIn(e, 'cai')).toEqual(['alx'])
    expect(sameWordIn(e, 'dam')).toEqual([])
  })

  it('reports dictionary words in the missing audio list', () => {
    const e = entries.find((x) => x.words.cai)!
    const row = missingAudio(content, {}, undefined, entries).find((r) => r.dialectId === 'cai')!
    expect(row.missing).toContain(dictAudioId(e.id))
  })

  it('gives dictionary pages their social cards', () => {
    expect(ogImageFor('/dictionary')).toBe('/og/dictionary.jpg')
    expect(ogImageFor(`/dictionary/${dictTopics[0].id}`)).toBe(`/og/dictionary/${dictTopics[0].id}.jpg`)
    expect(ogImageFor('/word/family.father')).toBe('/og/word.jpg')
  })
})
