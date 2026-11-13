/**
 * Lists phrases (everyday and famous) that have no audio yet, per dialect.
 *   npm run audio:missing            -> summary for every dialect
 *   npm run audio:missing -- cai     -> full list for one dialect
 *   npm run audio:missing -- --json  -> machine-readable output
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { AudioIndex, Content, FamousContent } from '../src/lib/types.ts'
import { missingAudio } from '../src/lib/validate.ts'

const root = join(import.meta.dirname, '..')
const content = JSON.parse(readFileSync(join(root, 'src', 'content', 'phrases.json'), 'utf8')) as Content
const famous = JSON.parse(readFileSync(join(root, 'src', 'content', 'famous.json'), 'utf8')) as FamousContent
const audioDir = join(root, 'public', 'audio')

const index: AudioIndex = {}
for (const d of content.dialects) {
  const dir = join(audioDir, d.id)
  index[d.id] = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4))
    : []
}

const args = process.argv.slice(2)
const rows = missingAudio(content, index, famous)

if (args.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2))
} else if (args[0]) {
  const row = rows.find((r) => r.dialectId === args[0])
  if (!row) {
    console.error(`Unknown dialect "${args[0]}". Known: ${content.dialects.map((d) => d.id).join(', ')}`)
    process.exit(1)
  }
  console.log(`${row.dialectId}: ${row.have}/${row.total} have audio, ${row.missing.length} missing`)
  for (const id of row.missing) console.log(`  public/audio/${row.dialectId}/${id}.mp3`)
} else {
  let missing = 0
  let total = 0
  for (const row of rows) {
    const d = content.dialects.find((x) => x.id === row.dialectId)!
    missing += row.missing.length
    total += row.total
    console.log(`${row.dialectId.padEnd(5)} ${String(row.have).padStart(3)}/${row.total}  missing ${String(row.missing.length).padStart(3)}  ${d.nameEn}`)
  }
  console.log(`\nTotal missing: ${missing} of ${total}`)
  console.log('Run with a dialect id (e.g. `npm run audio:missing -- cai`) to list the files.')
}
