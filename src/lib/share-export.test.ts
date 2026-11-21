import { readFileSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allFamous, dialects, phrases, STANDARD_ID } from './content'
import { sharePath } from './og'
import { checkFileBudget, countFiles } from '../../scripts/check-export-budget'

const rules = readFileSync(join(__dirname, '../../public/_redirects'), 'utf8')
  .split('\n').filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/\s+/))

// Model the documented Pages path placeholders; both slash variants must match.
function redirect(path: string) {
  for (const [source, destination, code] of rules) {
    const names: string[] = []
    const regex = source.replace(/:([A-Za-z]\w*)/g, (_, name) => { names.push(name); return '([^/]+)' })
    const match = path.match(new RegExp(`^${regex}$`))
    if (match) return { code, url: destination.replace(/:([A-Za-z]\w*)/g, (_, name) => match[names.indexOf(name) + 1]) }
  }
}

describe('compact share export', () => {
  it('retains every existing famous and everyday share target through two redirect rules', () => {
    const targets = allFamous.map(({ dialectId, phrase }) => [dialectId, phrase.id])
    for (const phrase of phrases) for (const d of dialects) {
      if (d.id !== STANDARD_ID && phrase.variants[d.id]) targets.push([d.id, phrase.id])
    }
    expect(targets.length).toBeGreaterThan(29000)
    expect(rules).toHaveLength(2)
    for (const [dialect, phrase] of targets) for (const slash of ['', '/']) {
      const result = redirect(sharePath(dialect, phrase) + slash)
      expect(result?.code).toBe('302')
      const url = new URL(result!.url, 'https://example.test')
      expect(url.pathname).toBe('/share/')
      expect(url.searchParams.get('dialect')).toBe(dialect)
      expect(url.searchParams.get('phrase')).toBe(phrase)
    }
    expect(redirect('/share/')).toBeUndefined()
  })

  it('counts nested assets and rejects exports beyond the safety budget', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lahjaty-budget-'))
    try {
      mkdirSync(join(dir, 'nested'))
      writeFileSync(join(dir, 'index.html'), '')
      writeFileSync(join(dir, 'nested', 'card.jpg'), '')
      expect(countFiles(dir)).toBe(2)
      expect(checkFileBudget(dir, 2)).toBe(2)
      expect(() => checkFileBudget(dir, 1)).toThrow('above the 1-file safety budget')
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })
})
