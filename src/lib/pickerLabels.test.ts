import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('readable search suggestion labels', () => {
  for (const component of ['SearchBox', 'ComparePicker']) {
    it(`${component} wraps the matched phrase and bounds long dialect badges`, () => {
      const code = readFileSync(join(__dirname, `../components/${component}.tsx`), 'utf8')
      expect(code).toContain('min-w-0 flex-1 break-words')
      expect(code).toContain('max-w-[42%] shrink-0 break-words')
      expect(code).not.toContain('block truncate')
    })
  }
})
