import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import es from './locales/es.json'

const messages = { en, es }

function getDefaultLocale() {
  const browserLocale = navigator.language || navigator.userLanguage

  if (browserLocale?.startsWith('es')) return 'es'

  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export function setLocale(locale) {
  if (messages[locale]) {
    i18n.global.locale.value = locale
    localStorage.setItem('tsundoku-locale', locale)
    document.documentElement.lang = locale
  }
}

export function getStoredLocale() {
  return localStorage.getItem('tsundoku-locale')
}

export function initLocale() {
  const stored = getStoredLocale()
  if (stored && messages[stored]) {
    i18n.global.locale.value = stored
    document.documentElement.lang = stored
  } else {
    const detected = getDefaultLocale()
    i18n.global.locale.value = detected
    document.documentElement.lang = detected
  }
}

export const availableLocales = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]
