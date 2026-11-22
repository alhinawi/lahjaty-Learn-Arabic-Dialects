import { describe, expect, it } from 'vitest'
import { getFamous } from './content'
import { validateNoteSources } from './noteSources'

describe('Palestinian food context notes', () => {
  it('describes musakhan preparation and a traditional, not exclusive, harvest link', () => {
    const p = getFamous('psu', 'famous.musakhan')!
    expect(p.note).toContain('traditionally associated with the olive harvest')
    expect(p.noteAr).toContain('يرتبط تقليديًا بموسم قطاف الزيتون')
    expect(p.noteSources).toHaveLength(2)
    expect(p.noteSources![1].title).toContain('(2022)')
    expect(validateNoteSources(p)).toEqual([])
  })

  it('links Nabulsi knafeh to Nablus, traditional cheese and syrup without an origin date', () => {
    const p = getFamous('psu', 'famous.kunafa_nabulsiyye')!
    expect(p.note).toContain('associated with Nablus')
    expect(p.note).toContain('traditionally made with Nabulsi cheese')
    expect(p.note).toContain('sugar syrup')
    expect(p.noteAr).toContain('بالجبن النابلسي وتُسقى بالقطر')
    expect(p.note).not.toMatch(/UNESCO|originated|invented|\b\d{3,4}\b/)
    expect(p.noteSources).toHaveLength(2)
    expect(validateNoteSources(p)).toEqual([])
  })
})
