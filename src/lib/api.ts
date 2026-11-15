// ==============================================================================
// Lahjaty Accounts API client (Cloudflare Workers + D1, see backend/)
// Owns the Bearer token lifecycle for the Lahjaty backend.
// ==============================================================================

const API_BASE = (process.env.NEXT_PUBLIC_LAHJATY_API_URL || 'https://lahjaty-api.hnz.workers.dev').replace(/\/$/, '')
const TOKEN_KEY = 'lahjaty_api_token'

export interface ApiUser {
  id: number
  name: string
  email: string
  created_at: string
}

export type AuthErrorCode =
  | 'email_taken'
  | 'password_short'
  | 'name_short'
  | 'email_invalid'
  | 'invalid_credentials'
  | 'session_expired'
  | 'incomplete'
  | 'network'
  | 'google_failed'
  | 'generic'

export interface ApiAuthResult {
  success: boolean
  user?: ApiUser
  token?: string
  error?: AuthErrorCode
}

export function saveApiToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

export function getApiToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearApiToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

// ---------- Google OAuth ----------

export interface AuthConfig {
  google: boolean
}

// Which sign-in providers the backend is configured for. Defaults to
// google:false so the button stays hidden whenever the check fails.
export async function apiGetAuthConfig(): Promise<AuthConfig> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/config`)
    if (!res.ok) return { google: false }
    const body = await res.json()
    return { google: Boolean(body && body.google) }
  } catch {
    return { google: false }
  }
}

// Where the site sends the browser to start Google sign-in.
export function googleLoginUrl(): string {
  return `${API_BASE}/api/auth/google/start?origin=${encodeURIComponent(window.location.origin)}`
}

// The worker redirects back to <origin>/#auth-callback?token=...&provider=google
// after Google sign-in. Reads and clears that hash, saving the API token.
// Returns the token (or an "error:<code>" string) when a callback was consumed.
export function consumeGoogleAuthCallback(): string | null {
  if (typeof window === 'undefined') return null
  const m = /^#auth-callback\?(.*)$/.exec(window.location.hash)
  if (!m) return null
  const params = new URLSearchParams(m[1])
  const token = params.get('token')
  const error = params.get('error')
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  if (token) {
    saveApiToken(token)
    return token
  }
  return error ? `error:${error}` : null
}

export async function apiGetMe(token: string): Promise<{ user: ApiUser } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function mapApiError(status: number, raw: unknown): AuthErrorCode {
  const body = (raw ?? {}) as { fields?: Record<string, string>; error?: string }
  const fields = body.fields ? body.fields : {}
  if (fields.email === 'already registered') return 'email_taken'
  if (fields.password) return 'password_short'
  if (fields.name) return 'name_short'
  if (fields.email) return 'email_invalid'
  if (body.error === 'invalid_credentials') return 'invalid_credentials'
  if (body.error === 'unauthorized') return 'session_expired'
  if (status === 422) return 'incomplete'
  return 'generic'
}

async function post<T>(path: string, payload: unknown, token?: string): Promise<{ status: number; body: T }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body: body as T }
}

export async function apiRegister(params: {
  name: string
  email: string
  password: string
  progress?: unknown
}): Promise<ApiAuthResult> {
  try {
    const { status, body } = await post<{ user?: ApiUser; token?: string }>('/api/auth/register', params)
    if ((status === 200 || status === 201) && body.user && body.token) {
      saveApiToken(body.token)
      return { success: true, user: body.user, token: body.token }
    }
    return { success: false, error: mapApiError(status, body) }
  } catch {
    return { success: false, error: 'network' }
  }
}

export async function apiLogin(email: string, password: string): Promise<ApiAuthResult> {
  try {
    const { status, body } = await post<{ user?: ApiUser; token?: string }>('/api/auth/login', { email, password })
    if (status === 200 && body.user && body.token) {
      saveApiToken(body.token)
      return { success: true, user: body.user, token: body.token }
    }
    return { success: false, error: mapApiError(status, body) }
  } catch {
    return { success: false, error: 'network' }
  }
}

export async function apiLogout(): Promise<void> {
  const token = getApiToken()
  clearApiToken()
  if (!token) return
  try {
    await post('/api/auth/logout', {}, token)
  } catch {
    // ignore network errors on logout
  }
}

export async function apiGetProgress(token: string): Promise<{ progress: unknown; updated_at: string | null } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function apiPutProgress(token: string, progress: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ progress }),
    })
    return res.ok
  } catch {
    return false
  }
}
