import { Heart } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import FamousCard from '../components/FamousCard'
import PhraseCard from '../components/PhraseCard'
import { getDialect, getFamous, getPhrase } from '../lib/content'
import { useT } from '../lib/i18n'
import { parseFavKey, useApp } from '../lib/store'

export default function FavoritesPage() {
  const t = useT()
  const favorites = useApp((s) => s.favorites)
  const items = favorites
    .map(parseFavKey)
    .filter(({ dialectId, phraseId }) => getDialect(dialectId) && (getPhrase(phraseId) || getFamous(dialectId, phraseId)))
    .reverse()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('favoritesTitle')}</h1>
      {items.length === 0 ? (
        <EmptyState icon={Heart} title={t('favoritesEmptyTitle')} body={t('favoritesEmpty')} action={{ to: '/lessons', label: t('favoritesEmptyCta') }} />
      ) : (
        <div className="space-y-3">
          {items.map(({ dialectId, phraseId }) => {
            const phrase = getPhrase(phraseId)
            return phrase ? (
              <PhraseCard key={`${dialectId}|${phraseId}`} phrase={phrase} dialectId={dialectId} showDialect />
            ) : (
              <FamousCard key={`${dialectId}|${phraseId}`} phrase={getFamous(dialectId, phraseId)!} dialectId={dialectId} showDialect />
            )
          })}
        </div>
      )}
    </div>
  )
}
