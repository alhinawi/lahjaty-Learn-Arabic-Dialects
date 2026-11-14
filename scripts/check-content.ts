/** Validates src/content/phrases.json, famous.json, voices.json and the dictionary. Exits 1 on problems. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Content, FamousContent, VoicesManifest } from '../src/lib/types.ts'
import { validateContent, validateDictionary } from '../src/lib/validate.ts'
import { readDictionary } from './lib/dictionary.ts'

const root = join(import.meta.dirname, '..')
const content = JSON.parse(readFileSync(join(root, 'src', 'content', 'phrases.json'), 'utf8')) as Content
const famous = JSON.parse(readFileSync(join(root, 'src', 'content', 'famous.json'), 'utf8')) as FamousContent
const voices = JSON.parse(readFileSync(join(root, 'src', 'content', 'voices.json'), 'utf8')) as VoicesManifest

const dict = readDictionary(root)
const errors = [...validateContent(content, voices, famous), ...validateDictionary(content, dict.index, dict.files)]
if (errors.length) {
  for (const e of errors) console.error('error:', e)
  console.error(`\n${errors.length} problem(s) found.`)
  process.exit(1)
}
console.log(
  `content ok: ${content.dialects.length} dialects, ${content.categories.length} situations, ${content.phrases.length} phrases, ${Object.values(famous.dialects).flat().length} famous phrases, ${voices.voices.length} voices, ${dict.index.topics.length} dictionary topics, ${dict.entries.length} dictionary words`,
)
