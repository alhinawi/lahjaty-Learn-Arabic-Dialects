import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Layout from './components/Layout'
import { useApp } from './lib/store'
import ComparePage from './pages/ComparePage'
import DialectsPage from './pages/DialectsPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import LessonsPage from './pages/LessonsPage'
import NotFoundPage from './pages/NotFoundPage'
import PracticePage from './pages/PracticePage'
import QuizPage from './pages/QuizPage'

export default function App() {
  const lang = useApp((s) => s.lang)
  const { pathname } = useLocation()

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
