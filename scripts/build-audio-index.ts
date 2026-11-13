/**
 * Scans public/audio/<dialectId>/<phraseId>.mp3 and writes src/generated/audio-index.json.
 * The site reads that file to decide which play buttons to show.
 * Runs automatically before `npm run dev`, `npm run build` and `npm test`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { AudioIndex, Content, FamousContent } from '../src/lib/types.ts'
import { audioPhraseIds } from '../src/lib/validate.ts'

const root = join(import.meta.dirname, '..')
const audioDir = join(root, 'public', 'audio')
const outDir = join(root, 'src', 'generated')
const content = JSON.parse(readFileSync(join(root, 'src', 'content', 'phrases.json'), 'utf8')) as Content
const famous = JSON.parse(readFileSync(join(root, 'src', 'content', 'famous.json'), 'utf8')) as FamousContent

const dialectIds = new Set(content.dialects.map((d) => d.id))
const index: AudioIndex = {}
const warnings: string[] = []

if (existsSync(audioDir)) {
  for (const dir of readdirSync(audioDir).sort()) {
    const full = join(audioDir, dir)
    if (!statSync(full).isDirectory()) continue
    if (!dialectIds.has(dir)) {
      warnings.push(`public/audio/${dir}: not a known dialect id, ignored`)
      continue
    }
    const phraseIds = new Set(audioPhraseIds(content, dir, famous))
    const ids: string[] = []
    for (const file of readdirSync(full).sort()) {
      if (!file.endsWith('.mp3')) continue
      const id = file.slice(0, -4)
      if (!phraseIds.has(id)) {
        warnings.push(`public/audio/${dir}/${file}: not a known phrase id, ignored`)
        continue
      }
      if (statSync(join(full, file)).size === 0) {
        warnings.push(`public/audio/${dir}/${file}: empty file, ignored`)
        continue
      }
      ids.push(id)
    }
    if (ids.length) index[dir] = ids
  }
}

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'audio-index.json'), JSON.stringify(index, null, 2) + '\n')
const total = Object.values(index).reduce((n, ids) => n + ids.length, 0)
for (const w of warnings) console.warn('warning:', w)
console.log(`audio index: ${total} files in ${Object.keys(index).length} dialects`)
