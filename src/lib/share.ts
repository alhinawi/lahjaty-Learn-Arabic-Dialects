export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'manual'

/** A cancelled sheet is intentional. Other failures still offer the same link. */
export async function shareOrCopy(title: string, url: string, api: {
  share?: (data: ShareData) => Promise<void>
  copy?: (value: string) => Promise<void>
}): Promise<ShareResult> {
  if (api.share) {
    try {
      await api.share({ title, text: title, url })
      return 'shared'
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') return 'cancelled'
    }
  }
  if (api.copy) {
    try { await api.copy(url); return 'copied' } catch { /* Show the same link for manual copying. */ }
  }
  return 'manual'
}
