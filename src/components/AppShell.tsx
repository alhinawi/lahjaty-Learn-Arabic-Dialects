'use client'

import { BookA, BookOpen, Columns3, GraduationCap, Heart, House, Languages, Menu, Moon, Search, Settings, Sun, Trophy, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { useT } from '../lib/i18n'
import { setupPwa } from '../lib/pwa'
import { restoreSavedProgress, useApp } from '../lib/store'
import BadgeToast from './BadgeToast'
import AuthButton from './AuthButton'
import InstallPrompt from './InstallPrompt'
import OfflineBanner from './OfflineBanner'
import Onboarding from './Onboarding'

const subscribeDark = (cb: () => void) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', cb)
  return () => media.removeEventListener('change', cb)
}
const isSystemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

/** The frame around every page: header, bottom nav, and the app-wide effects (theme, language, PWA). */
export default function AppShell({ children }: { children: ReactNode }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const theme = useApp((s) => s.theme)
  const toggleLang = useApp((s) => s.toggleLang)
  const setTheme = useApp((s) => s.setTheme)
  const pathname = usePathname() ?? '/'
  const systemDark = useSyncExternalStore(subscribeDark, isSystemDark, () => false)
  const dark = theme === 'dark' || (theme === 'system' && systemDark)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  // Route change closes the menu (adjusting state during render, the documented pattern).
  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    void restoreSavedProgress()
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', isDark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0d1413' : '#0e5443')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = lang === 'ar' ? 'لهجتي – Lahjaty | افهم كل عربي، من النيل إلى الفرات' : 'Lahjaty | Understand every Arab, from the Nile to the Euphrates'
  }, [lang])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    setupPwa()
  }, [])

  // The menu closes on outside tap and on Escape.
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

  // The essentials in the bottom bar; everything else lives in the header menu.
  const nav = [
    { to: '/', label: t('navHome'), icon: House, end: true },
    { to: '/lessons', label: t('navLessons'), icon: BookOpen, end: false },
    { to: '/dictionary', label: t('navDictionary'), icon: BookA, end: false },
    { to: '/practice', label: t('navPractice'), icon: GraduationCap, end: false },
  ]

  const menuLinks = [
    { to: '/search', label: t('searchLabel'), icon: Search },
    { to: '/compare', label: t('navCompare'), icon: Columns3 },
    { to: '/favorites', label: t('navFavorites'), icon: Heart },
    { to: '/profile', label: t('navProfile'), icon: Trophy },
    { to: '/settings', label: t('settings'), icon: Settings },
  ]

  const iconBtn = 'flex items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/20'
  // usePathname keeps the trailing slash (trailingSlash: true); the nav compares without it.
  const current = pathname.replace(/\/+$/, '') || '/'
  const isActive = (to: string, end: boolean) => (end ? current === to : current === to || current.startsWith(`${to}/`))

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pattern-stars sticky top-0 z-20 bg-brand-900 text-white shadow-lg dark:bg-brand-950">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-xl ring-1 ring-sun-400/60" />
            <span className="font-display text-xl font-bold">
              <span className="gold-text">{t('appName')}</span>
            </span>
          </Link>
          <div className="relative flex items-center gap-1.5" ref={menuRef}>
            <button
              type="button"
              onClick={toggleLang}
              aria-label={t('langToggleLabel')}
              className={`${iconBtn} gap-1.5 px-3 py-1.5 text-sm font-medium`}
            >
              <Languages className="h-4 w-4" aria-hidden />
              <span>{t('langToggle')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={t('menu')}
              className={`${iconBtn} h-8 w-8`}
            >
              {menuOpen ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
            </button>
            {menuOpen && (
              <div className="absolute top-full end-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-lg">
                <ul className="py-1">
                  {menuLinks.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <Link href={to} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-sand-100">
                        <Icon className="h-4 w-4 text-brand-700" aria-hidden />
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTheme(dark ? 'light' : 'dark')}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-sand-100"
                    >
                      {dark ? <Sun className="h-4 w-4 text-sun-500" aria-hidden /> : <Moon className="h-4 w-4 text-brand-700" aria-hidden />}
                      {dark ? t('themeToLight') : t('themeToDark')}
                    </button>
                  </li>
                  <AuthButton variant="menu" onNavigate={() => setMenuOpen(false)} />
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="gold-rule opacity-70" />
      </header>
      <OfflineBanner />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4 pb-28">
        <div key={current} className="animate-rise">
          {children}
        </div>
      </main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-12px_rgb(8_48_42/0.18)] backdrop-blur-md">
        <ul className="mx-auto grid max-w-2xl grid-cols-4">
          {nav.map(({ to, label, icon: Icon, end }) => {
            const active = isActive(to, end)
            return (
              <li key={to}>
                <Link
                  href={to}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                    active ? 'text-brand-700' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-sun-500" aria-hidden />}
                  <span className={`rounded-full px-4 py-1 transition ${active ? 'bg-brand-100' : ''}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <Onboarding />
      <BadgeToast />
      <InstallPrompt />
    </div>
  )
}
