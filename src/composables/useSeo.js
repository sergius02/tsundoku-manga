import { watch } from 'vue'

const DEFAULT_TITLE = 'Tsundoku'
const BASE_URL = 'https://tsundoku.app'

export function useSeo(options = {}) {
  function updateMeta() {
    const title = options.title ? `${options.title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
    document.title = title

    let descMeta = document.querySelector('meta[name="description"]')
    if (!descMeta) {
      descMeta = document.createElement('meta')
      descMeta.name = 'description'
      document.head.appendChild(descMeta)
    }
    descMeta.content = options.description || DEFAULT_TITLE

    const ogTitle = document.querySelector('meta[property="og:title"]') || createMeta('property', 'og:title')
    ogTitle.content = title

    const ogDesc = document.querySelector('meta[property="og:description"]') || createMeta('property', 'og:description')
    ogDesc.content = options.description || DEFAULT_TITLE

    const ogType = document.querySelector('meta[property="og:type"]') || createMeta('property', 'og:type')
    ogType.content = 'website'

    const ogUrl = document.querySelector('meta[property="og:url"]') || createMeta('property', 'og:url')
    ogUrl.content = options.canonical || window.location.href

    if (options.ogImage) {
      const ogImage = document.querySelector('meta[property="og:image"]') || createMeta('property', 'og:image')
      ogImage.content = options.ogImage
    }

    const twitterCard = document.querySelector('meta[name="twitter:card"]') || createMeta('name', 'twitter:card')
    twitterCard.content = 'summary_large_image'

    const twitterTitle = document.querySelector('meta[name="twitter:title"]') || createMeta('name', 'twitter:title')
    twitterTitle.content = title

    const twitterDesc = document.querySelector('meta[name="twitter:description"]') || createMeta('name', 'twitter:description')
    twitterDesc.content = options.description || DEFAULT_TITLE

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = options.canonical || window.location.href
  }

  function createMeta(nameAttr, nameValue) {
    const meta = document.createElement('meta')
    meta.setAttribute(nameAttr, nameValue)
    document.head.appendChild(meta)
    return meta
  }

  updateMeta()

  if (options.watch) {
    watch(options.watch, updateMeta, { immediate: true })
  }
}