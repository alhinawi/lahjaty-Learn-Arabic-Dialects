import { describe, expect, it } from 'vitest'
import { concepts, WORD_GROUPS } from '../../src/lib/content'
import { conceptChipLayout, fittingChips, homeCard } from './cards'

describe('concept chip layout', () => {
  it('keeps all 37 concept subtitles aligned with their visible chip prefix', () => {
    let checked = 0
    for (const concept of concepts) {
      if (!Object.keys(concept.words ?? {}).length) continue
      const layout = conceptChipLayout(concept.words!, WORD_GROUPS)
      const present = WORD_GROUPS.filter((g) => concept.words?.[g])
      expect(layout.visible.length, concept.id).toBe(fittingChips(layout.chips))
      expect(layout.shownGroups, concept.id).toEqual(present.filter((g) => layout.visible.includes(concept.words![g]!)))
      expect(layout.hidden + layout.shownGroups.length, concept.id).toBe(present.length)
      const svg = homeCard({ slogan: '', sloganEn: '', site: '', section: concept.name, greetings: layout.chips })
      expect((svg.match(/stroke-opacity=".55" stroke-width="1.3"/g) ?? []).length, concept.id).toBe(layout.visible.length)
      checked++
    }
    expect(checked).toBe(37)
  })

  it('attributes a shared visible chip to both regions without repeating it', () => {
    const result = conceptChipLayout({ egypt: 'على فكرة', sudan: 'على فكرة', levant: 'عفكرة' }, WORD_GROUPS)
    expect(result.visible).toEqual(['على فكرة', 'عفكرة'])
    expect(result.shownGroups).toEqual(['egypt', 'sudan', 'levant'])
    expect(result.hidden).toBe(0)
  })

  it('returns an empty layout when no regional words exist', () => {
    expect(conceptChipLayout({}, WORD_GROUPS)).toEqual({ chips: [], visible: [], shownGroups: [], hidden: 0 })
  })
})
