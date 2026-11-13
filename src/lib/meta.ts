import { useEffect } from 'react'

const SITE = 'لهجاتي – Lahjaty'

function setMeta(selector: string, attr: string, key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/** Sets the page title, description and Open Graph tags for the current route. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE}` : SITE
    document.title = full
    setMeta('meta[property="og:title"]', 'property', 'og:title', full)
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description)
      setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    }
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.origin + window.location.pathname)
  }, [title, description])
}
