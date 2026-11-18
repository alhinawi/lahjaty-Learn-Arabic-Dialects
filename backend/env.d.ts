declare namespace Cloudflare {
  interface Env {
    DB: D1Database
    ALLOWED_ORIGINS: string
    ELEVENLABS_KEYS_POOL?: string
    ELEVENLABS_KEY_LAHJATY?: string
    ELEVENLABS_KEY_LAHJATY_2?: string
    TTS_MODEL?: string
    TTS_DAILY_CHAR_CAP?: string
    TEST_MIGRATIONS: import('cloudflare:test').D1Migration[]
  }
}
