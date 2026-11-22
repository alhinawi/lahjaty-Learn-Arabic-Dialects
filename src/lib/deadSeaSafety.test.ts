import { describe, expect, it } from 'vitest'
import famous from '../content/famous.json'

describe('Dead Sea entry safety', () => {
  for (const [dialect, id] of [['psr', 'famous.dead_sea'], ['jor', 'famous.dead_sea_jo']] as const) {
    it(`keeps ${dialect} buoyancy separate from drowning protection`, () => {
      const entry = famous.dialects[dialect].find((phrase) => phrase.id === id)
      expect(entry).toBeDefined()
      expect(entry?.note).toContain('does not prevent drowning')
      expect(entry?.noteAr).toContain('لا يمنع خطر الغرق')
      expect(entry).not.toHaveProperty('example')
    })
  }
})
