import { BookOpen, Columns3, GraduationCap, Heart, House, Languages } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'
import { useT } from '../lib/i18n'
import { useApp } from '../lib/store'

export default function Layout() {
  const t = useT()
  const toggleLang = useApp((s) => s.toggleLang)

  const nav = [
    { to: '/', label: t('navHome'), icon: House, end: true },
    { to: '/lessons', label: t('navLessons'), icon: BookOpen, end: false },
    { to: '/compare', label: t('navCompare'), icon: Columns3, end: false },
    { to: '/practice', label: t('navPractice'), icon: GraduationCap, end: false },
    { to: '/favorites', label: t('navFavorites'), icon: Heart, end: false },
  ]

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 bg-brand-700 text-white shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold">{t('appName')}</span>
          </Link>
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t('langToggleLabel')}
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium hover:bg-white/25"
          >
            <Languages className="h-4 w-4" aria-hidden />
            <span>{t('langToggle')}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4 pb-28">
        <Outlet />
      </main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <ul className="mx-auto grid max-w-2xl grid-cols-5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                    isActive ? 'text-brand-700' : 'text-slate-500 hover:text-slate-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`rounded-full px-4 py-1 ${isActive ? 'bg-brand-100' : ''}`}>
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
    </div>
  )
}
