'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '../lib/i18n'
import { apiLogin, apiRegister, googleLoginUrl, type AuthErrorCode } from '../lib/api'
import { completeSignIn, snapshotProgress } from '../lib/auth'

const inputCls =
  'w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none ring-sun-400/40 focus:border-sun-400 focus:ring-4 dark:border-slate-700 dark:bg-slate-900'

/** Email + password and Google sign-in, inside a small modal opened from the header button. */
export default function AuthModal({ onClose, initialError = null }: { onClose: () => void; initialError?: AuthErrorCode | null }) {
  const t = useT()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AuthErrorCode | null>(initialError)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const result =
      tab === 'login'
        ? await apiLogin(email, password)
        : await apiRegister({ name, email, password, progress: snapshotProgress() })
    if (result.success && result.token) {
      await completeSignIn(result.token)
      onClose()
      return
    }
    setError(result.error ?? 'generic')
    setBusy(false)
  }

  const errKey = (error ? `authErr_${error}` : null) as Parameters<typeof t>[0] | null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/60 p-4 backdrop-blur-sm sm:items-center"
      onPointerDown={(e) => {
        if (cardRef.current && !cardRef.current.contains(e.target as Node)) onClose()
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="animate-pop max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 dark:text-slate-100"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="auth-title" className="font-display text-lg font-bold text-brand-800 dark:text-sun-300">
              {t('authSignInTitle')}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('authSubtitle')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('close')} className="-m-1 rounded-full p-1.5 text-slate-400 hover:bg-sand-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = googleLoginUrl()
          }}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-2.5 text-sm font-bold text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.1 44 30 44 24c0-1.3-.1-2.6-.4-3.9z" />
          </svg>
          <span>{t('authGoogle')}</span>
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-bold text-slate-400">{t('authOrEmail')}</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-sand-100 p-1 text-sm font-semibold dark:bg-slate-800">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setTab(m)
                setError(null)
              }}
              className={`rounded-full py-1.5 transition ${tab === m ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-brand-700 dark:text-slate-300'}`}
            >
              {t(m === 'login' ? 'authTabLogin' : 'authTabRegister')}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-2.5">
          {tab === 'register' && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('authName')}
              autoComplete="name"
              maxLength={60}
              className={inputCls}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('authEmail')}
            autoComplete="email"
            dir="ltr"
            className={`${inputCls} text-left`}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('authPassword')}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            dir="ltr"
            className={`${inputCls} text-left`}
          />
          {errKey && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{t(errKey)}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-b from-sun-300 to-sun-500 py-2.5 text-sm font-bold text-brand-950 transition active:scale-95 disabled:opacity-60"
          >
            {t(tab === 'login' ? 'authLoginSubmit' : 'authRegisterSubmit')}
          </button>
        </form>
      </div>
    </div>
  )
}
