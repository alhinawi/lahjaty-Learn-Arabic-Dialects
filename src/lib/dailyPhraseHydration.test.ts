import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FamousGrid from '../components/FamousGrid'

afterEach(() => vi.useRealTimers())
describe('daily phrase hydration snapshot', () => {
  it('keeps prerendered HTML stable across calendar days before mounting', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-24T12:00:00Z'))
    const before = renderToStaticMarkup(createElement(FamousGrid))
    vi.setSystemTime(new Date('2026-11-25T12:00:00Z'))
    expect(renderToStaticMarkup(createElement(FamousGrid))).toBe(before)
  })
})
