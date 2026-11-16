import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  allFamous,
  categories,
  concepts,
  dialects,
  famousByConcept,
  STANDARD_ID,
  WORD_GROUPS,
} from './content'
import { allDictEntries, topicEntries } from './dictionaryAll'
import { allEgyptNodes } from './egypt'
import { sharePath } from './og'
import { metadataFor, seoByPath, seoCatalog } from './seo'

/** Every route pattern that has a page, e.g. '/concepts/[conceptId]', from src/app on disk. */
function routePatterns(): string[] {
  const appDir = join(__dirname, '..', 'app')
  const patterns: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) {
        walk(full)
      } else if (name === 'page.tsx') {
        const route = '/' + relative(appDir, dir).split('\\').join('/')
        patterns.push(route === '/.' || route === '/' ? '/' : route)
      }
    }
  }
  walk(appDir)
  return patterns.sort()
}

/** One real path per dynamic segment name, so every route type is checked against the catalog. */
function fillPattern(pattern: string): string {
  const samples: Record<string, string> = {
    '[conceptId]': concepts.find((c) => famousByConcept(c.id).some((v) => v.dialectId !== STANDARD_ID))!.id,
    '[dialectId]': dialects.find((d) => d.id !== STANDARD_ID)!.id,
    '[topicId]': [...topicEntries.keys()][0],
    '[nodeId]': allEgyptNodes()[0].id,
    '[categoryId]': categories[0].id,
    '[mode]': 'meaning',
    '[group]': WORD_GROUPS[0],
    '[entryId]': allDictEntries[0].id,
  }
  if (pattern.includes('[phraseId]')) {
    const { dialectId, phrase } = allFamous[0]
    return sharePath(dialectId, phrase.id)
  }
  let path = pattern
  for (const [segment, value] of Object.entries(samples)) path = path.replaceAll(segment, value)
  return path
}

const patterns = routePatterns()
const catalog = seoCatalog()

describe('seo catalog route coverage', () => {
  it('finds the routes this app ships', () => {
    // Guards the walk itself: if src/app moves, this fails instead of passing vacuously.
    expect(patterns.length).toBeGreaterThanOrEqual(20)
    expect(patterns).toContain('/')
    expect(patterns).toContain('/share/[dialectId]/[phraseId]')
  })

  it('gives every route type an explicit catalog decision', () => {
    // A new page.tsx without a seoCatalog entry fails here, so indexing intent is never silent.
    for (const pattern of patterns) {
      const path = fillPattern(pattern)
      expect(seoByPath.has(path), `no catalog entry for route ${pattern} (sample ${path})`).toBe(true)
    }
  })

  it('lists only paths that match a real route', () => {
    const matchers = patterns.map((p) => new RegExp('^' + p.replace(/\[ [^\]]+\]|\[[^\]]+\]/g, '[^/]+') + '$'))
    for (const entry of catalog) {
      expect(
        matchers.some((m) => m.test(entry.path)),
        `catalog path ${entry.path} matches no route in src/app`,
      ).toBe(true)
    }
  })

  it('requires an explicit boolean indexing decision on every entry', () => {
    for (const entry of catalog) expect(typeof entry.sitemap, entry.path).toBe('boolean')
  })

  it('serves noindex,follow exactly on the entries decided as non-canonical', () => {
    for (const entry of catalog) {
      const robots = metadataFor(entry.path).robots
      if (entry.sitemap) {
        expect(robots, entry.path).toBeUndefined()
      } else {
        expect(robots, entry.path).toEqual({ index: false, follow: true })
      }
    }
  })

  it('keeps personal pages, interactive shells and share targets out of the sitemap', () => {
    for (const path of ['/favorites', '/settings', '/profile', '/search', '/compare', '/practice/cards', '/practice/meaning']) {
      expect(seoByPath.get(path)!.sitemap, path).toBe(false)
    }
    const { dialectId, phrase } = allFamous[0]
    expect(seoByPath.get(sharePath(dialectId, phrase.id))!.sitemap).toBe(false)
  })
})
