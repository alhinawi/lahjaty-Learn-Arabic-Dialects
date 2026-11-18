import { Hono } from 'hono'
import { TTS_MODEL_DEFAULT, TTS_VOICES } from './ttsVoices'

const DAY_CAP_DEFAULT = 9000 // characters per UTC day across the whole pool

/** First day of next month, when ElevenLabs quota resets. */
function nextMonthStart(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString()
}

interface KeyRow {
  id: number
  kind: string
  exhausted_until: string | null
}

/** Picks the next usable key id: pool keys round-robin first, dedicated last. */
export function pickKey(rows: KeyRow[], nowIso: string, lastId: number | null): KeyRow | null {
  const usable = (kind: string) =>
    rows.filter((r) => r.kind === kind && (!r.exhausted_until || r.exhausted_until <= nowIso)).map((r) => r.id)
  const pool = usable('pool').sort((a, b) => a - b)
  if (pool.length) {
    const next = pool.find((id) => lastId === null || id > lastId) ?? pool[0]
    return rows.find((r) => r.id === next)!
  }
  const dedicated = usable('dedicated').sort((a, b) => a - b)
  return dedicated.length ? rows.find((r) => r.id === dedicated[0])! : null
}

export function registerTts<E extends { Bindings: Cloudflare.Env }>(app: Hono<E>) {
  app.get('/api/tts/:dialect/:slug', async (c) => {
    const dialect = c.req.param('dialect')
    const slug = c.req.param('slug').replace(/\.mp3$/, '')
    const voice = TTS_VOICES[dialect]
    if (!voice) return c.json({ error: 'no_voice' }, 404)

    const row = await c.env.DB.prepare('SELECT text, chars FROM tts_manifest WHERE dialect = ? AND slug = ?')
      .bind(dialect, slug)
      .first<{ text: string; chars: number }>()
    if (!row) return c.json({ error: 'unknown_text' }, 404)

    const model = c.env.TTS_MODEL || TTS_MODEL_DEFAULT
    const cacheKey = `tts/${dialect}/${slug}.${voice.voiceId}.${model}.mp3`
    const hit = await c.env.AUDIO.get(cacheKey)
    if (hit) {
      return new Response(hit.body, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    const today = new Date().toISOString().slice(0, 10)
    const cap = Number(c.env.TTS_DAILY_CHAR_CAP || DAY_CAP_DEFAULT)
    const usage = await c.env.DB.prepare('SELECT chars FROM tts_usage WHERE day = ?').bind(today).first<{ chars: number }>()
    if ((usage?.chars ?? 0) + row.chars > cap) return c.json({ error: 'daily_cap' }, 503)

    const keys = (await c.env.DB.prepare('SELECT id, kind, exhausted_until FROM tts_keys').all<KeyRow>()).results
    // Secret order must match tts_keys ids: 1-9 shared pool, then 10-11 Lahjaty dedicated.
    const secrets = [...(c.env.ELEVENLABS_KEYS_POOL || '').split(',').map((s) => s.trim()).filter(Boolean)]
    if (c.env.ELEVENLABS_KEY_LAHJATY) secrets.push(c.env.ELEVENLABS_KEY_LAHJATY)
    if (c.env.ELEVENLABS_KEY_LAHJATY_2) secrets.push(c.env.ELEVENLABS_KEY_LAHJATY_2)
    const lastUsed = await c.env.DB.prepare("SELECT value FROM tts_state WHERE key = 'last_key'").first<{ value: number }>().catch(() => null)
    const chosen = pickKey(keys, new Date().toISOString(), lastUsed?.value ?? null)
    if (!chosen || !secrets[chosen.id - 1]) return c.json({ error: 'quota_exhausted' }, 503)

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'xi-api-key': secrets[chosen.id - 1], 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: row.text, model_id: model }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      if (res.status === 401 || res.status === 429 || /quota/i.test(body)) {
        await c.env.DB.prepare('UPDATE tts_keys SET exhausted_until = ? WHERE id = ?').bind(nextMonthStart(), chosen.id).run()
      }
      return c.json({ error: 'tts_failed' }, 502)
    }
    const audio = await res.arrayBuffer()
    c.executionCtx.waitUntil(
      Promise.all([
        c.env.AUDIO.put(cacheKey, audio, { httpMetadata: { contentType: 'audio/mpeg' } }),
        c.env.DB.prepare(
          'INSERT INTO tts_usage (day, chars) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET chars = chars + ?',
        ).bind(today, row.chars, row.chars).run(),
        c.env.DB.prepare("INSERT INTO tts_state (key, value) VALUES ('last_key', ?) ON CONFLICT(key) DO UPDATE SET value = ?")
          .bind(chosen.id, chosen.id).run(),
      ]),
    )
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  })
}
