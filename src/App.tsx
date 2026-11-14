import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Layout from './components/Layout'
import { useApp } from './lib/store'
import ComparePage from './pages/ComparePage'
import DialectPage from './pages/DialectPage'
import EgyptNodePage from './pages/EgyptNodePage'
import EgyptPage from './pages/EgyptPage'
import SearchPage from './pages/SearchPage'
import DialectsPage from './pages/DialectsPage'
import FavoritesPage from './pages/FavoritesPage'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import LessonsPage from './pages/LessonsPage'
import NotFoundPage from './pages/NotFoundPage'
import PracticePage from './pages/PracticePage'
import QuizPage from './pages/QuizPage'
import SettingsPage from './pages/SettingsPage'
import SharePage from './pages/SharePage'
import FlashcardsPage from './pages/FlashcardsPage'
import DictionaryPage from './pages/DictionaryPage'
import DictTopicPage from './pages/DictTopicPage'
import WordPage from './pages/WordPage'
import ProfilePage from './pages/ProfilePage'
import { syncSocialImage } from './lib/meta'

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
    document.title = lang === 'ar' ? 'لهجتي – Lahjaty | افهم كل عربي، من النيل إلى الفرات' : 'Lahjaty | Understand every Arab, from the Nile to the Euphrates'
  }, [lang])

  useEffect(() => {
    window.scrollTo(0, 0)
    syncSocialImage(pathname)
  }, [pathname])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dialects" element={<DialectsPage />} />
        <Route path="dialects/:dialectId" element={<DialectPage />} />
        <Route path="egypt" element={<EgyptPage />} />
        <Route path="egypt/:nodeId" element={<EgyptNodePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="lessons/:categoryId" element={<LessonPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="practice/cards" element={<FlashcardsPage />} />
        <Route path="practice/:mode" element={<QuizPage />} />
        <Route path="dictionary" element={<DictionaryPage />} />
        <Route path="dictionary/:topicId" element={<DictTopicPage />} />
        <Route path="word" element={<WordPage />} />
        <Route path="word/:entryId" element={<WordPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="share/:dialectId/:phraseId" element={<SharePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
