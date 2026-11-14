import { describe, expect, it } from 'vitest'
import content from '../content/phrases.json'
import intros from '../content/dialect-intros.json'

describe('dialect intros', () => {
  const ids = new Set((content as { dialects: { id: string }[] }).dialects.map((d) => d.id))
  const map = intros as Record<string, { where: { ar: string; en: string }; summary: { ar: string; en: string }; features: { ar: string; en: string }[] }>

  it('only describes dialects that exist', () => {
    for (const id of Object.keys(map)) expect(ids.has(id), id).toBe(true)
  })

  it('has Arabic and English text everywhere', () => {
    for (const [id, intro] of Object.entries(map)) {
      for (const bi of [intro.where, intro.summary, ...intro.features]) {
        expect(bi.ar.trim(), id).not.toBe('')
        expect(bi.en.trim(), id).not.toBe('')
      }
    }
  })
})
