import { describe, expect, it } from 'vitest'
import { categories } from './content'
import index from '../content/dictionary/index.json'
import { dialectReturnPath } from './dialectReturn'

describe('dialect selector return destination', () => {
  it('retains every destination emitted by current dialect chips', () => {
    const paths = ['/', '/lessons', '/dictionary', '/practice', '/practice/cards', ...categories.map((c) => `/lessons/${c.id}`), ...index.topics.map((t) => `/dictionary/${t.id}`)]
    for (const path of paths) {
      expect(dialectReturnPath(path)).toBe(path)
      if (path !== '/') expect(dialectReturnPath(`${path}/`)).toBe(path)
    }
  })
  it('rejects external, executable, encoded, malformed and unsupported destinations', () => {
    for (const path of [null, '', 'https://example.invalid', '//example.invalid', '/\\example.invalid', 'javascript:alert(1)', 'data:text/html,test', '%2Fpractice', '/%70ractice', '/practice?next=other', '/practice#other', '/practice/../settings', '/practice//', ' /practice', '/practice\n', '/lessons/not_a_category', '/dictionary/not_a_topic', '/settings']) expect(dialectReturnPath(path)).toBeNull()
  })
})
