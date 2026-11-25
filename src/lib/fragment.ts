/** A URL fragment is optional navigation, never a reason to fail the page. */
export function fragmentId(hash: string): string | null {
  if (!hash.startsWith('#') || hash.length === 1) return null
  try {
    return decodeURIComponent(hash.slice(1)) || null
  } catch {
    return null
  }
}
