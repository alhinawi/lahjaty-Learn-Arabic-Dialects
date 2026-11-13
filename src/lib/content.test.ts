import { describe, expect, it } from 'vitest'
import rawFamous from '../content/famous.json'
import rawContent from '../content/phrases.json'
import rawVoices from '../content/voices.json'
import { dialects, dialectsByRegion, normalize, phrases, searchDialects } from './content'
import type { Content, FamousContent, VoicesManifest } from './types'
import { missingAudio, validateContent } from './validate'

const content = rawContent as Content
const famous = rawFamous as FamousContent

describe('content', () => {
  it('is valid', () => {
    expect(validateContent(content, rawVoices as VoicesManifest, famous)).toEqual([])
  })

  it('starts with Standard Arabic and has phrases', () => {
    expect(dialects[0].id).toBe('fs')
    expect(phrases.length).toBeGreaterThan(0)
  })

  it('has the rural Delta dialects in the Egypt group', () => {
    const nile = dialectsByRegion().find((g) => g.region.id === 'nile')!.dialects.map((d) => d.id)
    for (const id of ['shq', 'dkh', 'mnf', 'ghr', 'bhr', 'dmt', 'kfs']) expect(nile).toContain(id)
  })

  it('puts every dialect in exactly one region group', () => {
    const grouped = dialectsByRegion().flatMap((g) => g.dialects.map((d) => d.id))
    expect(grouped.sort()).toEqual(dialects.map((d) => d.id).sort())
  })

  it('has famous phrases for every dialect', () => {
    for (const d of dialects) expect(famous.dialects[d.id]?.length ?? 0).toBeGreaterThan(0)
  })

  it('has no review flags anywhere', () => {
    expect(JSON.stringify(content)).not.toMatch(/review/i)
    expect(JSON.stringify(famous)).not.toMatch(/review/i)
  })
})

describe('validateContent', () => {
  it('reports a missing dialect text', () => {
    const broken = structuredClone(content)
    delete broken.phrases[0].variants.tun
    expect(validateContent(broken)).toContain('phrase "greetings.hello": missing text for dialect "tun"')
  })

  it('reports a dialect without famous phrases', () => {
    const broken = structuredClone(famous)
    delete broken.dialects.tun
    expect(validateContent(content, undefined, broken)).toContain('famous: dialect "tun" has no famous phrases')
  })

  it('reports an unknown concept', () => {
    const broken = structuredClone(famous)
    broken.dialects.cai[0].concept = 'nope'
    expect(validateContent(content, undefined, broken).some((e) => e.includes('unknown concept "nope"'))).toBe(true)
  })

  it('accepts voice overrides for famous phrases', () => {
    const id = famous.dialects.cai[0].id
    const voices: VoicesManifest = {
      voices: [{ id: 'v1', name: 'Test', gender: 'male', dialect: 'cai' }],
      defaults: {},
      phrases: { cai: { [id]: 'v1' } },
    }
    expect(validateContent(content, voices, famous)).toEqual([])
  })

  it('reports bad voice references', () => {
    const voices: VoicesManifest = {
      voices: [{ id: 'v1', name: 'Test', gender: 'male', dialect: 'cai' }],
      defaults: { cai: 'nope' },
      phrases: { cai: { 'greetings.unknown': 'v1' } },
    }
    const errors = validateContent(content, voices)
    expect(errors).toContain('voices.defaults.cai: unknown voice "nope"')
    expect(errors).toContain('voices.phrases.cai: unknown phrase "greetings.unknown"')
  })
})

describe('missingAudio', () => {
  it('includes each dialect\'s famous phrases', () => {
    const rows = missingAudio(content, {}, famous)
    const dkh = rows.find((r) => r.dialectId === 'dkh')!
    expect(dkh.total).toBe(content.phrases.length + famous.dialects.dkh.length)
    expect(dkh.missing).toContain(famous.dialects.dkh[0].id)
  })

  it('lists phrases without files per dialect', () => {
    const rows = missingAudio(content, { cai: ['greetings.hello'] })
    const cai = rows.find((r) => r.dialectId === 'cai')!
    expect(cai.have).toBe(1)
    expect(cai.missing).not.toContain('greetings.hello')
    expect(cai.missing).toHaveLength(cai.total - 1)
    const tun = rows.find((r) => r.dialectId === 'tun')!
    expect(tun.missing).toHaveLength(tun.total)
  })
})

describe('search', () => {
  it('ignores diacritics and alef forms', () => {
    expect(normalize('الإسكندرية')).toBe(normalize('الاسكندريه'))
  })

  it('finds dialects by Arabic name, country and English name', () => {
    expect(searchDialects('العراق').map((d) => d.id)).toEqual(['bag', 'mos', 'bas'])
    expect(searchDialects('tunis').map((d) => d.id)).toEqual(['tun'])
    expect(searchDialects('بيروت').map((d) => d.id)).toEqual(['leb'])
  })
})
