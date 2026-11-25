import Link from 'next/link'
import NoteSources from './NoteSources'
import type { Lang } from '../lib/store'

/** Preserve old links without continuing to teach the disputed dish meaning. */
export default function WithdrawnFeshlum({ lang }: { lang: Lang }) {
  const ar = lang === 'ar'
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="withdrawn-title">
      <h1 id="withdrawn-title" className="text-xl font-bold text-slate-900">{ar ? 'تصحيح مدخل: فشلوم' : 'Entry correction: Feshlum'}</h1>
      <p className="text-sm leading-relaxed text-slate-700">{ar
        ? 'سحبنا هذا المدخل من قائمة بنغازي لأن المعنى السابق، «طبق سمك حار»، لم نجد له توثيقًا. المصادر أدناه تذكر فشلوم منطقة في طرابلس. لا نعرض المثال السابق باعتباره شاهدًا على هذا المعنى.'
        : 'We withdrew this entry from the Benghazi list because we could not verify its former meaning, a spicy fish dish. The sources below identify Feshlum as an area in Tripoli. The former example is not shown as evidence for that meaning.'}</p>
      <NoteSources lang={lang} sources={[
        { title: 'Alwasat: Feshlum area in Tripoli, September 2025', titleAr: 'الوسط: منطقة فشلوم في طرابلس، سبتمبر ٢٠٢٥', url: 'https://alwasat.ly/news/libya/492419' },
        { title: 'Alwasat: Tripoli municipality street works, April 2025', titleAr: 'الوسط: أعمال شارع فشلوم ببلدية طرابلس، أبريل ٢٠٢٥', url: 'https://alwasat.ly/news/libya/472526' },
      ]} />
      <Link href="/dialects/ben/" className="block rounded-xl bg-brand-700 px-4 py-3 text-center font-semibold text-white">{ar ? 'العودة إلى قائمة بنغازي' : 'Back to the Benghazi list'}</Link>
    </section>
  )
}
