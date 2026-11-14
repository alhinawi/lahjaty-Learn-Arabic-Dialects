import { describe, expect, it } from 'vitest'
import { getDialect } from './content'
import { GOALS, goalCategories, SUGGESTED_TO_LEARN } from './goals'
import { messages } from './i18n'

describe('learning goals', () => {
  it('every goal suggests situations that exist', () => {
    for (const g of GOALS) {
      expect(goalCategories(g.id).map((c) => c.id)).toEqual(g.categories)
    }
  })
  it('every goal has a name and a line in both languages', () => {
    for (const g of GOALS) {
      for (const lang of ['ar', 'en'] as const) {
        const m = messages[lang] as Record<string, string>
        expect(m[`goal_${g.id}`]).toBeTruthy()
        expect(m[`goal_${g.id}Body`]).toBeTruthy()
      }
    }
  })
  it('suggested dialects exist', () => {
    for (const id of SUGGESTED_TO_LEARN) expect(getDialect(id)).toBeTruthy()
  })
})
