import { useEffect } from 'react'
import { ogImageFor, SITE_NAME, SITE_URL } from './og'

const SITE = SITE_NAME

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
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', full)
    if (description) setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    syncSocialImage(window.location.pathname)
  }, [title, description])
}

/** Points og:url, og:image and twitter:image at the card of the current page (the build draws them all). */
export function syncSocialImage(pathname: string) {
  const image = SITE_URL + ogImageFor(pathname)
  setMeta('meta[property="og:url"]', 'property', 'og:url', SITE_URL + pathname)
  setMeta('meta[property="og:image"]', 'property', 'og:image', image)
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image)
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
}
