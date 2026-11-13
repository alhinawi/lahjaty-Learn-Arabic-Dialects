import { describe, expect, it } from 'vitest'
import { dialects } from './content'
import {
  allEgyptNodes,
  egyptContrasts,
  egyptNodeForDialect,
  egyptRegions,
  egyptShapes,
  egyptSources,
  exampleDialectFor,
  getEgyptNode,
  pointsFor,
} from './egypt'

describe('Egypt taxonomy', () => {
  const nodes = allEgyptNodes()

  it('has unique ids that do not clash with paths', () => {
    const ids = nodes.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every node an Arabic and an English name and a kind', () => {
    for (const n of nodes) {
      expect(n.name.trim()).not.toBe('')
      expect(n.nameEn.trim()).not.toBe('')
      expect(['arabic', 'language']).toContain(n.kind)
    }
  })

  it('only maps to dialects that exist', () => {
    const known = new Set(dialects.map((d) => d.id))
    for (const n of nodes) if (n.dialectId) expect(known.has(n.dialectId), n.id).toBe(true)
  })

  it('maps every existing Egyptian dialect into the taxonomy', () => {
    for (const id of ['cai', 'alx', 'sai', 'sin', 'dkh', 'shq', 'dmt', 'mnf', 'ghr', 'kfs', 'bhr']) {
      if (dialects.some((d) => d.id === id)) expect(egyptNodeForDialect(id), id).toBeDefined()
    }
  })

  it('labels Nubian and Siwi as languages, not Arabic dialects', () => {
    for (const id of ['nubia', 'kenzi', 'nobiin', 'siwi']) expect(getEgyptNode(id)?.kind, id).toBe('language')
    for (const id of ['kenzi', 'nobiin', 'siwi']) expect(exampleDialectFor(getEgyptNode(id)!)).toBeUndefined()
  })

  it('has a shape and map points for every region', () => {
    for (const r of egyptRegions) {
      expect(egyptShapes[r.id], r.id).toBeDefined()
      expect(pointsFor(r).length, r.id).toBeGreaterThan(0)
    }
  })

  it('cites only sources that exist', () => {
    const ids = new Set(egyptSources.map((s) => s.id))
    for (const n of nodes) for (const s of n.sources ?? []) expect(ids.has(s), `${n.id}:${s}`).toBe(true)
  })

  it('points contrasts and see-also links at real nodes', () => {
    for (const c of egyptContrasts) for (const f of c.forms) expect(getEgyptNode(f.node), f.node).toBeDefined()
    for (const n of nodes) for (const id of n.seeAlso ?? []) expect(getEgyptNode(id), id).toBeDefined()
  })
})
