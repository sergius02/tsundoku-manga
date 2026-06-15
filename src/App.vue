<template>
  <div class="app" :data-theme="theme">
    <a href="#main-content" class="skip-link">{{ $t('accessibility.skipToContent') }}</a>
    <LoginModal v-if="!authStore.isAuthenticated" />
    <header v-if="authStore.isAuthenticated" class="header">
      <div class="page-container header-inner">
        <router-link to="/" class="logo">
          <svg viewBox="0 0 32 32" class="logo-icon" aria-hidden="true">
            <rect width="32" height="32" rx="4" fill="currentColor"/>
            <rect x="4" y="20" width="24" height="8" rx="1" fill="var(--bg-primary)"/>
            <rect x="6" y="22" width="20" height="1" fill="currentColor" opacity="0.2"/>
            <rect x="6" y="6" width="20" height="12" rx="1" fill="var(--bg-primary)"/>
            <rect x="8" y="8" width="16" height="1" fill="currentColor" opacity="0.2"/>
            <rect x="8" y="10" width="16" height="1" fill="currentColor" opacity="0.2"/>
            <rect x="8" y="12" width="16" height="1" fill="currentColor" opacity="0.2"/>
            <rect x="8" y="14" width="16" height="1" fill="currentColor" opacity="0.2"/>
            <rect x="8" y="16" width="16" height="1" fill="currentColor" opacity="0.2"/>
          </svg>
          <span>Tsundoku</span>
        </router-link>

        <button
          class="mobile-menu-toggle"
          @click="toggleMobileMenu"
          :aria-expanded="showMobileMenu"
          aria-controls="mobile-menu"
          :aria-label="showMobileMenu ? $t('menu.close') : $t('menu.open')"
        >
          <svg v-if="!showMobileMenu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <nav class="nav" aria-label="Main navigation">
          <router-link to="/" class="nav-link">{{ $t('nav.library') }}</router-link>
          <router-link to="/search" class="nav-link">{{ $t('search.title') }}</router-link>
          <router-link to="/add" class="nav-link">{{ $t('nav.add') }}</router-link>

          <div class="locale-select" @click.stop>
            <button class="locale-toggle" @click="toggleLocaleMenu" :aria-label="$t('language.select')" aria-haspopup="listbox" :aria-expanded="showLocaleMenu">
              <span class="locale-flag" aria-hidden="true">{{ currentLocaleFlag }}</span>
            </button>
            <div v-if="showLocaleMenu" class="locale-menu" role="listbox" :aria-label="$t('language.select')">
              <button
                v-for="loc in availableLocales"
                :key="loc.code"
                class="locale-option"
                :class="{ active: locale === loc.code }"
                role="option"
                :aria-selected="locale === loc.code"
                @click="selectLocale(loc.code)"
              >
                <span class="locale-flag" aria-hidden="true">{{ loc.flag }}</span>
                <span>{{ loc.name }}</span>
              </button>
            </div>
            <div v-if="showLocaleMenu" class="locale-backdrop" @click="closeLocaleMenu"></div>
          </div>

          <button class="theme-toggle" @click="toggleTheme" :aria-label="$t('theme.toggle')">
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>

          <router-link to="/settings" class="settings-btn" :aria-label="$t('settings.title')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </router-link>
        </nav>

        <div v-if="showMobileMenu" id="mobile-menu" class="mobile-menu" role="navigation" aria-label="Mobile navigation">
          <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">{{ $t('nav.library') }}</router-link>
          <router-link to="/search" class="mobile-nav-link" @click="closeMobileMenu">{{ $t('search.title') }}</router-link>
          <router-link to="/add" class="mobile-nav-link" @click="closeMobileMenu">{{ $t('nav.add') }}</router-link>
          <router-link to="/settings" class="mobile-nav-link" @click="closeMobileMenu">{{ $t('settings.title') }}</router-link>
          <div class="mobile-divider"></div>
          <button class="mobile-nav-btn" @click="toggleTheme">
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <span>{{ theme === 'dark' ? $t('theme.light') : $t('theme.dark') }}</span>
          </button>
          <div class="mobile-locale-select">
            <span class="mobile-locale-label">{{ $t('language.select') }}</span>
            <div class="mobile-locale-options" role="listbox" :aria-label="$t('language.select')">
              <button
                v-for="loc in availableLocales"
                :key="loc.code"
                class="mobile-locale-option"
                :class="{ active: locale === loc.code }"
                role="option"
                :aria-selected="locale === loc.code"
                @click="selectLocale(loc.code)"
              >
                <span class="locale-flag" aria-hidden="true">{{ loc.flag }}</span>
                <span>{{ loc.name }}</span>
              </button>
            </div>
          </div>
        </div>
        <div v-if="showMobileMenu" class="mobile-backdrop" @click="closeMobileMenu"></div>
      </div>
    </header>
    <main v-if="authStore.isAuthenticated" id="main-content" class="main" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer v-if="authStore.isAuthenticated" class="footer">
      <div class="page-container footer-inner">
        <span class="footer-copyright">{{ $t('footer.copyright', { year: currentYear }) }}</span>
        <nav class="footer-links" :aria-label="$t('footer.sourceCode')">
          <a
            v-if="sourceUrl"
            :href="sourceUrl"
            class="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            &lt;/&gt; {{ $t('footer.sourceCode') }}
          </a>
          <a
            v-if="licenseUrl"
            :href="licenseUrl"
            class="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('footer.license') }}
          </a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { availableLocales, setLocale } from './i18n/index.js'
import { useAuthStore } from './stores/auth.js'
import LoginModal from './components/LoginModal.vue'

const { locale, t } = useI18n()
const authStore = useAuthStore()

const theme = ref('light')
const showLocaleMenu = ref(false)
const showMobileMenu = ref(false)
const authCheckDone = ref(false)

const sourceUrl = import.meta.env.VITE_SOURCE_URL || 'https://github.com/sergius02/tsundoku-manga'
const licenseUrl = import.meta.env.VITE_LICENSE_URL || 'https://www.gnu.org/licenses/agpl-3.0.html'
const currentYear = new Date().getFullYear()

const currentLocaleFlag = computed(() => {
  const loc = availableLocales.find(l => l.code === locale.value)
  return loc?.flag || '🌐'
})

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
  showMobileMenu.value = false
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('tsundoku-theme', theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
}

function toggleLocaleMenu() {
  showLocaleMenu.value = !showLocaleMenu.value
}

function closeLocaleMenu() {
  showLocaleMenu.value = false
}

function selectLocale(code) {
  setLocale(code)
  closeLocaleMenu()
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    closeLocaleMenu()
    closeMobileMenu()
  }
}

onMounted(async () => {
  const saved = localStorage.getItem('tsundoku-theme')
  if (saved) {
    theme.value = saved
    document.documentElement.setAttribute('data-theme', saved)
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
    document.documentElement.setAttribute('data-theme', 'dark')
  }
  document.addEventListener('keydown', handleKeydown)
  await authStore.checkAuth()
  authCheckDone.value = true
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  z-index: 10000;
  padding: 12px 24px;
  background: var(--accent);
  color: white;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 16px;
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  transition: background-color 0.2s ease-out;
}

.header {
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.2s ease-out, border-color 0.2s ease-out;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Noto Serif JP', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.nav-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.nav-link.router-link-active {
  color: var(--accent);
  background-color: rgba(230, 57, 70, 0.08);
}

.theme-toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  margin-left: 8px;
}

.theme-toggle:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease-out;
}

.theme-toggle:hover svg {
  transform: rotate(15deg);
}

.settings-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  margin-left: 8px;
  text-decoration: none;
}

.settings-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.settings-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.settings-btn svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease-out;
}

.settings-btn:hover svg {
  transform: rotate(45deg);
}

.locale-select {
  position: relative;
}

.locale-toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  margin-left: 8px;
}

.locale-toggle:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.locale-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.locale-flag {
  font-size: 18px;
  line-height: 1;
}

.locale-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow);
  padding: 4px;
  min-width: 150px;
  z-index: 1001;
}

.locale-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;
}

.locale-option:hover {
  background: var(--bg-secondary);
}

.locale-option.active {
  background: rgba(230, 57, 70, 0.08);
  color: var(--accent);
}

.locale-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.main {
  flex: 1;
  padding: 32px 0;
}

.mobile-menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.mobile-menu-toggle:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.mobile-menu-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.mobile-menu-toggle svg {
  width: 24px;
  height: 24px;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 64px;
  left: 16px;
  right: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow);
  padding: 8px;
  z-index: 1001;
  flex-direction: column;
}

.mobile-nav-link {
  display: block;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.15s;
}

.mobile-nav-link:hover {
  background-color: var(--bg-secondary);
}

.mobile-nav-link.router-link-active {
  color: var(--accent);
  background-color: rgba(230, 57, 70, 0.08);
}

.mobile-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

.mobile-nav-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.15s;
}

.mobile-nav-btn:hover {
  background-color: var(--bg-secondary);
}

.mobile-nav-btn svg {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.mobile-locale-select {
  padding: 12px 16px;
}

.mobile-locale-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.mobile-locale-options {
  display: flex;
  gap: 8px;
}

.mobile-locale-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
}

.mobile-locale-option.active {
  border-color: var(--accent);
  color: var(--accent);
}

.mobile-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
}

@media (max-width: 640px) {
  .nav {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }

  .mobile-backdrop {
    display: block;
  }

  .header-inner {
    justify-content: space-between;
  }
}

.page-enter-active {
  animation: page-slide-in 0.4s ease-out;
  will-change: transform, opacity;
}

.page-leave-active {
  animation: page-slide-out 0.3s ease-in;
  will-change: transform, opacity;
}

@keyframes page-slide-in {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes page-slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(30px);
  }
}

.footer {
  border-top: 1px solid var(--border);
  background-color: var(--bg-card);
  padding: 16px 0;
  transition: background-color 0.2s ease-out, border-color 0.2s ease-out;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--text-secondary);
}

.footer-copyright {
  white-space: nowrap;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.15s, background-color 0.15s;
}

.footer-link:hover {
  color: var(--accent);
  background-color: var(--bg-secondary);
}

.footer-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .footer-inner {
    justify-content: center;
    text-align: center;
  }
}
</style>