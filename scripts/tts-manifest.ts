/**
 * Writes src/generated/tts-voices.json (which dialects have a proxied
 * ElevenLabs voice) and backend/tts-manifest.sql (every text the /api/tts
 * proxy is allowed to speak, so strangers cannot burn the quota with
 * arbitrary text). Run: npm run tts:manifest. Apply the SQL with:
 *   wrangler d1 execute lahjaty --file=backend/tts-manifest.sql
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { TTS_VOICES } from '../backend/src/ttsVoices.ts'
import type { Content, FamousContent } from '../src/lib/types.ts'
import { dictAudioId } from '../src/lib/validate.ts'
import { readDictionary } from './lib/dictionary.ts'

const root = join(import.meta.dirname, '..')
const content = JSON.parse(readFileSync(join(root, 'src', 'content', 'phrases.json'), 'utf8')) as Content
const famous = JSON.parse(readFileSync(join(root, 'src', 'content', 'famous.json'), 'utf8')) as FamousContent
const dictionary = readDictionary(root).entries

mkdirSync(join(root, 'src', 'generated'), { recursive: true })
writeFileSync(join(root, 'src', 'generated', 'tts-voices.json'), JSON.stringify(TTS_VOICES, null, 2))

const esc = (s: string) => `'${s.replace(/'/g, "''")}'`
const rows: string[] = []
for (const [dialect] of Object.entries(TTS_VOICES)) {
  for (const p of content.phrases) {
    const text = p.variants[dialect]?.text?.trim()
    if (text) rows.push(`(${esc(dialect)}, ${esc(p.id)}, ${esc(text)}, ${[...text].length})`)
  }
  for (const f of famous.dialects[dialect] ?? []) {
    const text = f.text.trim()
    rows.push(`(${esc(dialect)}, ${esc(f.id)}, ${esc(text)}, ${[...text].length})`)
  }
  for (const e of dictionary) {
    const text = e.words[dialect]?.trim()
    if (text) rows.push(`(${esc(dialect)}, ${esc(dictAudioId(e.id))}, ${esc(text)}, ${[...text].length})`)
  }
}

const sql = [
  'DELETE FROM tts_manifest;',
  "INSERT OR IGNORE INTO tts_keys (id, kind) VALUES (1,'pool'),(2,'pool'),(3,'pool'),(4,'pool'),(5,'pool'),(6,'pool'),(7,'pool'),(8,'pool'),(9,'pool'),(10,'dedicated'),(11,'dedicated');",
  ...(rows.length
    ? [`INSERT OR REPLACE INTO tts_manifest (dialect, slug, text, chars) VALUES\n${rows.join(',\n')};`]
    : []),
  '',
].join('\n')
writeFileSync(join(root, 'backend', 'tts-manifest.sql'), sql)
console.log(`tts voices: ${Object.keys(TTS_VOICES).length} dialects, ${rows.length} speakable texts`)
