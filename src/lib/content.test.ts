import { describe, expect, it } from 'vitest'
import rawContent from '../content/phrases.json'
import rawVoices from '../content/voices.json'
import { dialects, dialectsByRegion, normalize, phrases, searchDialects } from './content'
import type { Content, VoicesManifest } from './types'
import { missingAudio, validateContent } from './validate'

const content = rawContent as Content

describe('content', () => {
  it('is valid', () => {
    expect(validateContent(content, rawVoices as VoicesManifest)).toEqual([])
  })

  it('has 36 dialects (MSA + 35) and 60 phrases', () => {
    expect(dialects).toHaveLength(36)
    expect(dialects[0].id).toBe('fs')
    expect(phrases).toHaveLength(60)
  })

  it('puts every dialect in exactly one region group', () => {
    const grouped = dialectsByRegion().flatMap((g) => g.dialects.map((d) => d.id))
    expect(grouped.sort()).toEqual(dialects.map((d) => d.id).sort())
  })

  it('has no review flags anywhere', () => {
    expect(JSON.stringify(content)).not.toMatch(/review/i)
  })
})

describe('validateContent', () => {
  it('reports a missing dialect text', () => {
    const broken = structuredClone(content)
    delete broken.phrases[0].variants.tun
    expect(validateContent(broken)).toContain('phrase "greetings.hello": missing text for dialect "tun"')
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
  it('lists phrases without files per dialect', () => {
    const rows = missingAudio(content, { cai: ['greetings.hello'] })
    const cai = rows.find((r) => r.dialectId === 'cai')!
    expect(cai.have).toBe(1)
    expect(cai.missing).not.toContain('greetings.hello')
    expect(cai.missing).toHaveLength(59)
    expect(rows.find((r) => r.dialectId === 'tun')!.missing).toHaveLength(60)
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
