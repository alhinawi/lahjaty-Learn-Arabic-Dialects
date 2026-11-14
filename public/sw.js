/* Lahjaty service worker (plain, no build step): offline support with the same policies as before.
 * - pages: network first (3s), cached copies for offline
 * - /_next/static/: cache first, a year (hashed files)
 * - /audio/: cache first, range requests served from the cache
 * - /og/ and /og-default.jpg: stale while revalidate
 */
const VERSION = 'v1'
const PAGES = `pages-${VERSION}`
const ASSETS = `assets-${VERSION}`
const AUDIO = `audio-${VERSION}`
const IMAGES = `images-${VERSION}`
const ALL = [PAGES, ASSETS, AUDIO, IMAGES]

const MAX = { [PAGES]: 150, [ASSETS]: 300, [AUDIO]: 400, [IMAGES]: 60 }

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !ALL.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function trim(name) {
  const cache = await caches.open(name)
  const keys = await cache.keys()
  const extra = keys.length - (MAX[name] ?? 100)
  for (let i = 0; i < extra; i++) await cache.delete(keys[i])
}

async function put(name, request, response) {
  if (!response || response.status !== 200) return
  const cache = await caches.open(name)
  await cache.put(request, response)
  trim(name)
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
}

/** Pages: fresh copy when the network answers in time, otherwise the cached page (or the cached home). */
async function networkFirst(request) {
  const cache = await caches.open(PAGES)
  try {
    const response = await Promise.race([fetch(request), timeout(3000)])
    put(PAGES, request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    return cached || (await cache.match('/')) || Response.error()
  }
}

async function cacheFirst(name, request) {
  const cache = await caches.open(name)
  const cached = await cache.match(request, { ignoreVary: true })
  if (cached) {
    // Media elements ask for byte ranges: answer them from the cached full file.
    const range = request.headers.get('range')
    if (range) {
      const bytes = await cached.arrayBuffer()
      const m = /bytes=(\d+)-(\d*)/.exec(range)
      if (m) {
        const start = Number(m[1])
        const end = m[2] ? Number(m[2]) : bytes.byteLength - 1
        return new Response(bytes.slice(start, end + 1), {
          status: 206,
          headers: { 'Content-Type': cached.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}` },
        })
      }
    }
    return cached
  }
  const response = await fetch(request)
  put(name, request, response.clone())
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGES)
  const cached = await cache.match(request)
  const fresh = fetch(request)
    .then((response) => {
      put(IMAGES, request, response.clone())
      return response
    })
    .catch(() => undefined)
  return cached || (await fresh) || Response.error()
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  } else if (url.pathname.startsWith('/_next/static/') || url.pathname === '/favicon.svg' || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(ASSETS, request))
  } else if (url.pathname.startsWith('/audio/')) {
    event.respondWith(cacheFirst(AUDIO, request))
  } else if (url.pathname.startsWith('/og/') || url.pathname === '/og-default.jpg') {
    event.respondWith(staleWhileRevalidate(request))
  }
})
