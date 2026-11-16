import { allFamous, concepts, getConcept, phrases, STANDARD_ID, WORD_GROUPS } from './content'
import { allEgyptNodes } from './egypt'
import type { EgyptNode } from './egypt'
import { translate, type MessageKey } from './i18n'
import type { FamousPhrase, Phrase, WordGroup } from './types'

const TASHKEEL = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** Folds the spellings people mix up so that near spellings still match. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKC')
    .replace(TASHKEEL, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ک/g, 'ك')
    .replace(/ی/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

export type SearchHit =
  | { kind: 'phrase'; key: string; phrase: Phrase; score: number; matched: string; dialectId?: string }
  | { kind: 'concept'; key: string; conceptId: string; score: number; matched: string; dialectId?: string }
  | { kind: 'famous'; key: string; dialectId: string; phrase: FamousPhrase; score: number; matched: string }
  | { kind: 'egypt'; key: string; node: EgyptNode; score: number; matched: string; dialectId?: string }
  | { kind: 'region'; key: string; group: WordGroup; score: number; matched: string; dialectId?: string }

/** The macro-regions, searchable by their Arabic and English names. */
const GROUP_LABEL_KEY: Record<WordGroup, MessageKey> = {
  egypt: 'groupEgypt',
  sudan: 'groupSudan',
  levant: 'groupLevant',
  iraq: 'groupIraq',
  gulf: 'groupGulf',
  yemen: 'groupYemen',
  maghreb: 'groupMaghreb',
}

export function regionLabel(group: WordGroup, lang: 'ar' | 'en'): string {
  return translate(lang, GROUP_LABEL_KEY[group])
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

interface Doc {
  hit: DistributiveOmit<Exclude<SearchHit, { kind: 'famous' }>, 'score' | 'matched' | 'dialectId'> | DistributiveOmit<Extract<SearchHit, { kind: 'famous' }>, 'score' | 'matched'>
  /** normalized text, original text, dialect it belongs to (if any) */
  fields: [string, string, string | undefined][]
}

let index: Doc[] | null = null

function build(): Doc[] {
  const docs: Doc[] = []
  for (const p of phrases) {
    const fields: Doc['fields'] = [[normalize(p.english), p.english, undefined]]
    for (const [dialectId, v] of Object.entries(p.variants)) {
      fields.push([normalize(v.text), v.text, dialectId])
      if (v.translit) fields.push([normalize(v.translit), v.translit, dialectId])
    }
    docs.push({ hit: { kind: 'phrase', key: `p:${p.id}`, phrase: p }, fields })
  }
  const byConcept = new Map<string, Doc>()
  for (const c of concepts) {
    // Macro-region words have no single-dialect attribution. Keep dialectId undefined.
    const texts = [c.name, c.nameEn, ...Object.values(c.words ?? {})]
    const doc: Doc = {
      hit: { kind: 'concept', key: `c:${c.id}`, conceptId: c.id },
      fields: [...new Set(texts)].map((text) => [normalize(text), text, undefined]),
    }
    byConcept.set(c.id, doc)
    docs.push(doc)
  }
  for (const { dialectId, phrase } of allFamous) {
    const fields: Doc['fields'] = [
      [normalize(phrase.text), phrase.text, dialectId],
      [normalize(phrase.english), phrase.english, undefined],
      [normalize(phrase.standard), phrase.standard, undefined],
    ]
    const doc = phrase.concept ? byConcept.get(phrase.concept) : undefined
    if (doc) {
      doc.fields.push(...fields)
    } else {
      docs.push({ hit: { kind: 'famous', key: `f:${dialectId}:${phrase.id}`, dialectId, phrase }, fields })
    }
  }
  for (const group of WORD_GROUPS) {
    const ar = regionLabel(group, 'ar')
    const en = regionLabel(group, 'en')
    docs.push({ hit: { kind: 'region', key: `r:${group}`, group }, fields: [[normalize(ar), ar, undefined], [normalize(en), en, undefined]] })
  }
  for (const n of allEgyptNodes()) {
    const texts = [n.name, n.nameEn, ...(n.governorates?.ar ?? []), ...(n.governorates?.en ?? [])]
    docs.push({ hit: { kind: 'egypt', key: `e:${n.id}`, node: n }, fields: texts.map((x) => [normalize(x), x, undefined]) })
  }
  return docs
}

function scoreField(field: string, q: string, words: string[]): number {
  if (!field) return 0
  if (field === q) return 100
  const padded = ` ${field} `
  if (padded.includes(` ${q} `)) return 80
  if (field.startsWith(q)) return 70
  if (padded.includes(` ${q}`)) return 60
  if (field.includes(q)) return 45
  if (words.length > 1 && words.every((w) => field.includes(w))) return 35
  return 0
}

/** Client-side search over every phrase, every dialect, Standard Arabic and English. */
export function search(query: string, limit = 30): SearchHit[] {
  const q = normalize(query)
  if (!q) return []
  index ??= build()
  const words = q.split(' ').filter(Boolean)
  const hits: SearchHit[] = []
  for (const doc of index) {
    let best = 0
    let matched = ''
    let dialectId: string | undefined
    for (const [norm, orig, d] of doc.fields) {
      const s = scoreField(norm, q, words) - norm.length / 400
      if (s > best) {
        best = s
        matched = orig
        dialectId = d
      }
    }
    if (best > 0) {
      const base = doc.hit.kind === 'famous' ? best - 2 : best
      hits.push({ ...doc.hit, score: base, matched, dialectId: doc.hit.kind === 'famous' ? doc.hit.dialectId : dialectId } as SearchHit)
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

export function hitTitle(hit: SearchHit, lang: 'ar' | 'en'): string {
  if (hit.kind === 'phrase') return lang === 'ar' ? hit.phrase.variants[STANDARD_ID]?.text ?? hit.phrase.english : hit.phrase.english
  if (hit.kind === 'concept') {
    const c = getConcept(hit.conceptId)!
    return lang === 'ar' ? c.name : c.nameEn
  }
  if (hit.kind === 'egypt') return lang === 'ar' ? hit.node.name : hit.node.nameEn
  if (hit.kind === 'region') return regionLabel(hit.group, lang)
  return lang === 'ar' ? hit.phrase.standard : hit.phrase.english
}

/** Regions whose signature word is the matched field, without narrowing it to a dialect. */
export function regionalMatchGroups(hit: SearchHit): WordGroup[] {
  if (hit.kind !== 'concept') return []
  const words = getConcept(hit.conceptId)?.words
  return WORD_GROUPS.filter((group) => words?.[group] && normalize(words[group]!) === normalize(hit.matched))
}

export type ComparableHit =
  | { kind: 'phrase'; id: string; matched: string; dialectId?: string; standard: string; english: string }
  | { kind: 'concept'; id: string; matched: string; dialectId?: string }

/** Search results that the comparison page can show: everyday phrases, or shared meanings of famous phrases. */
export function comparableHits(query: string, kind: 'phrase' | 'concept', limit = 8): ComparableHit[] {
  const out: ComparableHit[] = []
  const seen = new Set<string>()
  for (const h of search(query, 400)) {
    if (out.length >= limit) break
    if (kind === 'phrase' && h.kind === 'phrase' && !seen.has(h.phrase.id)) {
      seen.add(h.phrase.id)
      out.push({ kind: 'phrase', id: h.phrase.id, matched: h.matched, dialectId: h.dialectId, standard: h.phrase.variants[STANDARD_ID]?.text ?? '', english: h.phrase.english })
    } else if (kind === 'concept' && h.kind === 'concept' && !seen.has(h.conceptId)) {
      seen.add(h.conceptId)
      out.push({ kind: 'concept', id: h.conceptId, matched: h.matched, dialectId: h.dialectId })
    }
  }
  return out
}
