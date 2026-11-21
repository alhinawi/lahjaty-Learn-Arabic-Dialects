import { readdirSync } from 'node:fs'
import { join } from 'node:path'

// Cloudflare Pages Free has a 20,000-file cap. Keep a 5,000-file safety margin.
export const FILE_BUDGET = 15_000
export function countFiles(root: string): number {
  return readdirSync(root, { withFileTypes: true }).reduce((count, entry) =>
    count + (entry.isDirectory() ? countFiles(join(root, entry.name)) : 1), 0)
}

export function checkFileBudget(root = 'out', budget = FILE_BUDGET): number {
  const count = countFiles(root)
  if (count > budget) throw new Error(`Static export has ${count} files, above the ${budget}-file safety budget`)
  console.log(`export budget: ${count}/${budget} files (Cloudflare Pages Free cap: 20000)`)
  return count
}

if (process.argv[1]?.endsWith('check-export-budget.ts')) checkFileBudget()
