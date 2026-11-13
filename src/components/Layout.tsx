import { BookOpen, Columns3, GraduationCap, Heart, House, Languages, Moon, Search, Settings, Sun } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useT } from '../lib/i18n'
import { useApp } from '../lib/store'
import MyDialectSheet from './MyDialectSheet'

export default function Layout() {
  const t = useT()
  const toggleLang = useApp((s) => s.toggleLang)
  const setTheme = useApp((s) => s.setTheme)
  const theme = useApp((s) => s.theme)
  const { pathname } = useLocation()
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const nav = [
    { to: '/', label: t('navHome'), icon: House, end: true },
    { to: '/lessons', label: t('navLessons'), icon: BookOpen, end: false },
    { to: '/compare', label: t('navCompare'), icon: Columns3, end: false },
    { to: '/practice', label: t('navPractice'), icon: GraduationCap, end: false },
    { to: '/favorites', label: t('navFavorites'), icon: Heart, end: false },
  ]

  const iconBtn = 'flex items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/20'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pattern-stars sticky top-0 z-20 bg-brand-900 text-white shadow-lg dark:bg-brand-950">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-xl ring-1 ring-sun-400/60" />
            <span className="font-display text-xl font-bold">
              <span className="gold-text">{t('appName')}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
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
              onClick={() => setTheme(dark ? 'light' : 'dark')}
              aria-label={dark ? t('themeToLight') : t('themeToDark')}
              title={dark ? t('themeToLight') : t('themeToDark')}
              className={`${iconBtn} h-8 w-8`}
            >
              {dark ? <Sun className="h-4 w-4 text-sun-300" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            </button>
            <Link to="/search" aria-label={t('searchLabel')} className={`${iconBtn} h-8 w-8`}>
              <Search className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/settings" aria-label={t('settings')} className={`${iconBtn} h-8 w-8`}>
              <Settings className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="gold-rule opacity-70" />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4 pb-28">
        <div key={pathname} className="animate-rise">
          <Outlet />
        </div>
      </main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_-12px_rgb(8_48_42/0.18)] backdrop-blur-md">
        <ul className="mx-auto grid max-w-2xl grid-cols-5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-brand-700' : 'text-slate-500 hover:text-slate-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-sun-500" aria-hidden />}
                    <span className={`rounded-full px-4 py-1 transition ${isActive ? 'bg-brand-100' : ''}`}>
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <MyDialectSheet />
    </div>
  )
}
