'use client'

import { useEffect, useRef, useState } from 'react'
import { LogIn, LogOut, User } from 'lucide-react'
import { useT } from '../lib/i18n'
import { apiGetAuthConfig, consumeGoogleAuthCallback } from '../lib/api'
import { completeSignIn, initAuth, signOut, useAuth } from '../lib/auth'
import AuthModal from './AuthModal'

/**
 * The small sign-in button in the header. Renders nothing until the backend
 * confirms sign-in is configured (/api/auth/config), so guests and offline
 * visitors never see it. When signed in it shows the account name and a logout.
 */
export default function AuthButton({
  variant = 'header',
  onNavigate,
}: {
  /** 'menu' renders list-item rows for the burger menu instead of header pills. */
  variant?: 'header' | 'menu'
  /** Called when an action is taken, so the parent menu can close. */
  onNavigate?: () => void
}) {
  const t = useT()
  const user = useAuth((s) => s.user)
  const [enabled, setEnabled] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [googleError, setGoogleError] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    // A returning Google sign-in redirect (#auth-callback?token=...) is consumed first.
    const callback = consumeGoogleAuthCallback()
    void (async () => {
      if (callback && !callback.startsWith('error:')) {
        await completeSignIn(callback)
      } else {
        await initAuth()
        if (callback && !cancelled) {
          setGoogleError(true)
          setModalOpen(true)
        }
      }
      const cfg = await apiGetAuthConfig()
      if (!cancelled) setEnabled(cfg.google)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  if (!enabled) return null

  const itemCls = 'flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-sand-100'

  if (variant === 'menu') {
    if (user) {
      return (
        <>
          <li className="border-t border-slate-200 px-4 py-2.5">
            <span className="flex items-center gap-3 text-sm font-medium">
              <User className="h-4 w-4 text-brand-700" aria-hidden />
              <span className="truncate">{user.name}</span>
            </span>
            <span className="block truncate ps-7 text-xs text-slate-500" dir="ltr">
              {user.email}
            </span>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onNavigate?.()
                void signOut()
              }}
              className={itemCls}
            >
              <LogOut className="h-4 w-4 text-brand-700" aria-hidden />
              {t('authLogout')}
            </button>
          </li>
        </>
      )
    }
    return (
      <li className="border-t border-slate-200">
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            setModalOpen(true)
          }}
          className={itemCls}
        >
          <LogIn className="h-4 w-4 text-brand-700" aria-hidden />
          {t('authSignIn')}
        </button>
        {modalOpen && <AuthModal initialError={googleError ? 'google_failed' : null} onClose={() => setModalOpen(false)} />}
      </li>
    )
  }

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium ring-1 ring-white/15 transition hover:bg-white/20"
        >
          <User className="h-4 w-4" aria-hidden />
          <span className="max-w-20 truncate">{user.name.split(' ')[0]}</span>
        </button>
        {menuOpen && (
          <div className="absolute top-full end-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-lg">
            <p className="truncate border-b border-slate-100 px-4 py-2.5 text-xs text-slate-500" dir="ltr">
              {user.email}
            </p>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                void signOut()
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-sand-100"
            >
              <LogOut className="h-4 w-4 text-brand-700" aria-hidden />
              {t('authLogout')}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium ring-1 ring-white/15 transition hover:bg-white/20"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        <span>{t('authSignIn')}</span>
      </button>
      {modalOpen && <AuthModal initialError={googleError ? 'google_failed' : null} onClose={() => setModalOpen(false)} />}
    </>
  )
}
