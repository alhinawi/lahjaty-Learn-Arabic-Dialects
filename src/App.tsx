import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Layout from './components/Layout'
import { useApp } from './lib/store'
import ComparePage from './pages/ComparePage'
import DialectPage from './pages/DialectPage'
import DialectsPage from './pages/DialectsPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import LessonsPage from './pages/LessonsPage'
import NotFoundPage from './pages/NotFoundPage'
import PracticePage from './pages/PracticePage'
import QuizPage from './pages/QuizPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const lang = useApp((s) => s.lang)
  const theme = useApp((s) => s.theme)
  const { pathname } = useLocation()

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0d1413' : '#0e5443')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = lang === 'ar' ? 'لهجتي | تعلّم اللهجات العربية' : 'Lahjaty | Learn Arabic dialects'
  }, [lang])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dialects" element={<DialectsPage />} />
        <Route path="dialects/:dialectId" element={<DialectPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="lessons/:categoryId" element={<LessonPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="practice/:mode" element={<QuizPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
