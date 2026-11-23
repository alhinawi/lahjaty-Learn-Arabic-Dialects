import { STANDARD_ID } from './content'

/** Expressions are not dialects: count each non-standard dialect once. */
export function conceptDialectCount(variants: readonly { dialectId: string }[]): number {
  return new Set(variants.filter((v) => v.dialectId !== STANDARD_ID).map((v) => v.dialectId)).size
}

/** Keep every expression in its original order within each dialect. */
export function variantsByDialect<T extends { dialectId: string }>(variants: readonly T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const variant of variants) {
    const group = groups.get(variant.dialectId) ?? []
    group.push(variant)
    groups.set(variant.dialectId, group)
  }
  return groups
}
