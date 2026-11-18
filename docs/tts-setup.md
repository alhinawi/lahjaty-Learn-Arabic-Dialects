# Real dialect voices (ElevenLabs proxy)

The site speaks in three tiers, in this order:
1. recorded MP3 in `public/audio/` (best, see CONTENT.md)
2. the accounts Worker `/api/tts/:dialect/:slug.mp3` (real dialect voice from ElevenLabs)
3. the browser's built-in Arabic voice (free, sounds like MSA)

Keys never touch client code. The Worker holds them as secrets; the browser
only ever calls the Worker.

## One-time wiring (owner side)

1. Create the R2 bucket and apply the migration:
   ```
   cd backend
   wrangler r2 bucket create lahjaty-audio
   wrangler d1 migrations apply lahjaty --remote
   ```
2. Set the secrets (pool first, then the two Lahjaty-dedicated keys; this
   order must match `tts_keys` ids 1-9 pool, 10-11 dedicated):
   ```
   wrangler secret put ELEVENLABS_KEYS_POOL     # 9 keys, comma-separated
   wrangler secret put ELEVENLABS_KEY_LAHJATY   # token 10
   wrangler secret put ELEVENLABS_KEY_LAHJATY_2 # token 11
   ```
3. Choose a voice per dialect from the ElevenLabs voice library and fill
   `backend/src/ttsVoices.ts` (voice IDs are not secrets). Commit.
4. Regenerate and upload the speakable-text manifest, then deploy:
   ```
   npm run tts:manifest
   wrangler d1 execute lahjaty --remote --file=backend/tts-manifest.sql
   wrangler deploy
   ```

## How quota is protected

- The Worker only speaks texts listed in `tts_manifest`; anything else is 404,
  so nobody can burn characters with arbitrary text.
- Each text is paid once: audio is cached in R2 forever, keyed by
  dialect + slug + voice + model.
- Daily cap: `TTS_DAILY_CHAR_CAP` (var, default 9000 chars/UTC day).
- Pool keys rotate round-robin; a key that answers quota-exceeded is parked
  until the 1st of next month. The two Lahjaty keys are used only when the
  whole pool is parked.
- Model defaults to `eleven_multilingual_v2`; set var `TTS_MODEL` to
  `eleven_flash_v2_5` after verifying its Arabic sounds right (cheaper).
- When everything is exhausted the endpoint returns 503 and the site's play
  button hides itself, falling back to browser speech on the next visit.
