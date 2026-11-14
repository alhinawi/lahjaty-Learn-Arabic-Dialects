import { useEffect, lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Layout from './components/Layout'
import { useApp } from './lib/store'
import HomePage from './pages/HomePage'
import { syncSocialImage } from './lib/meta'

const ComparePage = lazy(() => import('./pages/ComparePage'))
const DialectPage = lazy(() => import('./pages/DialectPage'))
const EgyptNodePage = lazy(() => import('./pages/EgyptNodePage'))
const EgyptPage = lazy(() => import('./pages/EgyptPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const DialectsPage = lazy(() => import('./pages/DialectsPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const LessonsPage = lazy(() => import('./pages/LessonsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const PracticePage = lazy(() => import('./pages/PracticePage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const SharePage = lazy(() => import('./pages/SharePage'))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'))
const DictionaryPage = lazy(() => import('./pages/DictionaryPage'))
const DictTopicPage = lazy(() => import('./pages/DictTopicPage'))
const WordPage = lazy(() => import('./pages/WordPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

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
