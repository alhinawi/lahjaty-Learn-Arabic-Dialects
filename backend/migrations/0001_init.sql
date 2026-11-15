-- Lahjaty API schema (Cloudflare D1 / SQLite)
-- Accounts + per-user learning progress synced from the site's localStorage blob.

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  -- Google sign-in: set when the account is linked to a Google identity.
  -- Users who register via Google have an empty password_hash (password login
  -- stays impossible for them until they set a password).
  google_sub TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX idx_users_google_sub ON users(google_sub) WHERE google_sub IS NOT NULL;

-- Login tokens. Only the SHA-256 of the token is stored.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Same JSON the site keeps in localStorage ("lahjaty:v1" persisted state), one row per learner.
-- Written once at registration/first login (migration of the guest's local progress),
-- then kept in sync.
CREATE TABLE progress (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- One-time redirect states for the Google authorization-code flow.
CREATE TABLE oauth_states (
  state TEXT PRIMARY KEY,
  origin TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
