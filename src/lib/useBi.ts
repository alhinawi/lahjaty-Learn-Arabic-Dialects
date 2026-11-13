import { useApp } from './store'

export function useBi() {
  const lang = useApp((s) => s.lang)
  return {
    lang,
    bi: (b?: { ar: string; en: string }) => (b ? b[lang] : ''),
    list: (b?: { ar: string[]; en: string[] }) => (b ? b[lang] : []),
    nodeName: (n: { name: string; nameEn: string }) => (lang === 'ar' ? n.name : n.nameEn),
  }
}
