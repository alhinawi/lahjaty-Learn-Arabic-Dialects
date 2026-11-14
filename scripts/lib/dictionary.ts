/** Reads the dictionary from disk for the Node scripts (the site lazy-loads the same files). */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DictEntry, DictIndex, DictTopicFile } from '../../src/lib/types.ts'

export function readDictionary(root: string): { index: DictIndex; files: DictTopicFile[]; entries: DictEntry[] } {
  const dir = join(root, 'src', 'content', 'dictionary')
  const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) as DictIndex
  const files = index.topics.flatMap((t) => {
    try {
      return [JSON.parse(readFileSync(join(dir, `${t.id}.json`), 'utf8')) as DictTopicFile]
    } catch {
      return []
    }
  })
  return { index, files, entries: files.flatMap((f) => f.entries) }
}
