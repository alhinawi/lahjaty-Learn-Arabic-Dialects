import { STANDARD_ID } from './content'

/** Expressions are not dialects: count each non-standard dialect once. */
export function conceptDialectCount(variants: readonly { dialectId: string }[]): number {
  return new Set(variants.filter((v) => v.dialectId !== STANDARD_ID).map((v) => v.dialectId)).size
}
