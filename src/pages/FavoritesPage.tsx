import { Heart } from 'lucide-react'
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
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          <Heart className="mx-auto mb-3 h-8 w-8 text-rose-300" aria-hidden />
          {t('favoritesEmpty')}
        </div>
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
