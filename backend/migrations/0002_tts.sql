-- TTS proxy: allowed text manifest, key pool state, daily usage.
CREATE TABLE tts_manifest (
  dialect TEXT NOT NULL,
  slug TEXT NOT NULL,
  text TEXT NOT NULL,
  chars INTEGER NOT NULL,
  PRIMARY KEY (dialect, slug)
);
CREATE TABLE tts_keys (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL,              -- 'pool' or 'dedicated'
  exhausted_until TEXT             -- ISO date; NULL means usable
);
CREATE TABLE tts_usage (
  day TEXT PRIMARY KEY,            -- YYYY-MM-DD (UTC)
  chars INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE tts_state (
  key TEXT PRIMARY KEY,
  value INTEGER
);
