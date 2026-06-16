<template>
  <div class="page-container">
    <div class="search-header">
      <h1>{{ $t('search.addVolumeTitle') || $t('search.title') }}</h1>
      <p>{{ $t('search.subtitle') }}</p>
    </div>

    <div class="search-controls">
      <div class="search-form">
        <SearchInput
          v-model="searchQuery"
          :placeholder="$t('search.isbnPlaceholder')"
          :loading="searching"
          @keyup.enter="search"
        />
        <button class="btn btn-primary" @click="search" :disabled="!searchQuery.trim() || searching">
          <svg v-if="!searching" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span v-if="searching" class="spinner-sm"></span>
          {{ $t('search.search') }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      {{ error }}
    </div>

    <div v-if="result && !(result.notFound && result.openLibraryMissing)" class="result-card">
      <div class="result-cover">
        <img v-if="result.cover_url" :src="result.cover_url" :alt="result.title" />
        <div v-else class="cover-placeholder">{{ result.title?.[0] || '?' }}</div>
      </div>
      <div class="result-info">
        <h2>{{ result.title }}</h2>
        <p v-if="result.author?.length" class="author">{{ result.author.join(', ') }}</p>
        <div class="result-meta">
          <span v-if="result.publisher">{{ result.publisher }}</span>
          <span v-if="result.isbn" class="mono">ISBN: {{ result.isbn }}</span>
          <span v-if="result.volumeNumber" class="volume-badge">Vol. {{ result.volumeNumber }}</span>
          <span v-if="result.source" class="source-info">
            {{ $t('search.sourcePrefix') }}
            <span class="source-badge" :class="result.source">
              {{ result.source === 'openlibrary' ? $t('search.sourceOpenLibrary') : $t('search.sourceGoogle') }}
            </span>
          </span>
        </div>
        <p v-if="result.seriesName !== result.title" class="series-hint">
          {{ $t('search.detectedSeries') }}: <strong>{{ result.seriesName }}</strong>
        </p>
      </div>
    </div>

    <div v-if="result?.openLibraryMissing && result?.notFound" class="openlibrary-contribution">
      <div class="contribution-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="contribution-content">
        <p class="contribution-title">{{ $t('search.openLibraryMissingTitle') }}</p>
        <p class="contribution-subtitle">{{ $t('search.openLibraryContributeSubtitle') }}</p>
        <p class="contribution-text">{{ $t('search.openLibraryMissingText') }}</p>
        <p class="contribution-warning">{{ $t('search.openLibraryContributeWarning') }}</p>
        <p class="contribution-isbn">
          ISBN: <code>{{ result?.isbn }}</code>
          <button class="copy-isbn-btn" @click="copyIsbn" :title="$t('search.copyIsbn')">
            <svg v-if="!isbnCopied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </p>
        <a href="https://openlibrary.org/books/add" target="_blank" rel="noopener noreferrer" class="contribution-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          {{ $t('search.openLibraryContributeLink') }}
        </a>
        <p class="contribution-credit">{{ $t('search.openLibraryCredit') }}</p>
      </div>
    </div>

    <div v-if="result && !result.notFound && !addedSuccess" class="manga-selector">
      <h3>{{ $t('search.whichManga') }}</h3>

      <div v-if="filteredMangas.length > 0" class="manga-list">
        <div
          v-for="manga in filteredMangas"
          :key="manga.id"
          :class="['manga-option', { selected: selectedMangaId === manga.id, 'auto-matched': autoMatchedId === manga.id }]"
          @click="selectedMangaId = manga.id"
        >
          <span v-if="autoMatchedId === manga.id" class="auto-match-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            {{ $t('search.autoMatch') }}
          </span>
          <img v-if="manga.cover_url" :src="manga.cover_url" :alt="manga.title" class="manga-thumb" />
          <div v-else class="manga-thumb-placeholder">{{ manga.title[0] }}</div>
          <div class="manga-option-info">
            <span class="manga-option-title">{{ manga.title }}</span>
            <span class="manga-option-meta">{{ manga.volumes_total || 0 }} {{ $t('library.stats.volumes') }}</span>
          </div>
          <svg v-if="selectedMangaId === manga.id" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
      </div>

      <p v-if="mangas.length > 0 && filteredMangas.length === 0" class="no-matches">
        {{ $t('search.noMatch') }} "{{ result.seriesName }}". {{ $t('search.createNew') }}.
      </p>

      <div class="new-manga-toggle" @click="showNewMangaForm = !showNewMangaForm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ $t('search.createNewManga') }}
      </div>

      <div v-if="showNewMangaForm" class="new-manga-form">
        <input
          type="text"
          v-model="newMangaTitle"
          :placeholder="$t('search.mangaNamePlaceholder')"
        />
        <button class="btn btn-secondary" @click="createAndSelect" :disabled="!newMangaTitle.trim()">
          {{ $t('search.createAndAdd') }}
        </button>
      </div>

      <div v-if="selectedMangaId && !showNewMangaForm" class="add-tomo-actions">
        <div v-if="autoMatchedId === selectedMangaId" class="auto-match-actions">
          <button class="btn btn-primary btn-lg" @click="addVolumeToSelected" :disabled="adding">
            <span v-if="adding" class="spinner-sm"></span>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ $t('volume.addTo') }} {{ selectedMangaTitle }}
          </button>
          <button class="btn btn-secondary btn-lg" @click="openEditVolumeModal" :disabled="adding">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ $t('common.edit') }}
          </button>
        </div>
        <button v-else class="btn btn-primary btn-lg" @click="addVolumeToSelected" :disabled="adding">
          <span v-if="adding" class="spinner-sm"></span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ $t('volume.addTo') }} {{ selectedMangaTitle }}
        </button>
      </div>
    </div>

    <div v-if="(notFound && !result) || (result?.notFound && !result?.openLibraryMissing)" class="not-found">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
      <h2>{{ $t('search.noResults') }}</h2>
      <p>{{ $t('search.noResultsHint') }}</p>
    </div>

    <div v-if="addedSuccess" class="success-message">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      {{ $t('search.volumeAdded') }}
      <button class="btn btn-secondary" @click="reset">{{ $t('search.addAnother') }}</button>
    </div>

    <Modal v-model="showEditVolumeModal" :title="$t('volume.editVolume')">
      <form @submit.prevent="addVolumeToSelected" class="edit-tomo-form">
        <div class="form-group">
          <label>{{ $t('volume.isbn') }}</label>
          <input type="text" v-model="editVolumeForm.isbn" />
        </div>
        <div class="form-group">
          <label>{{ $t('volume.volumeNumber') }}</label>
          <input type="number" v-model.number="editVolumeForm.volume_number" min="1" />
        </div>
        <div class="form-group">
          <label>{{ $t('volume.title') }}</label>
          <input type="text" v-model="editVolumeForm.title" />
        </div>
        <div class="form-group">
          <label>{{ $t('volume.status') }}</label>
          <select v-model="editVolumeForm.status">
            <option value="unread">{{ $t('status.unread') }}</option>
            <option value="reading">{{ $t('status.reading') }}</option>
            <option value="read">{{ $t('status.read') }}</option>
          </select>
        </div>
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="editVolumeForm.acquired" />
            {{ $t('volume.acquired') }}
          </label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-ghost" @click="showEditVolumeModal = false">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary" @click="addVolumeToSelected">{{ $t('common.add') }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { searchByISBN, createManga, getMangas, addVolume as apiAddVolume } from '../api/index.js'
import SearchInput from '../components/SearchInput.vue'
import Modal from '../components/Modal.vue'

const searchQuery = ref('')
const searching = ref(false)
const adding = ref(false)
const error = ref('')
const result = ref(null)
const notFound = ref(false)
const mangas = ref([])
const selectedMangaId = ref(null)
const autoMatchedId = ref(null)
const showNewMangaForm = ref(false)
const newMangaTitle = ref('')
const addedSuccess = ref(false)
const showEditVolumeModal = ref(false)
const editVolumeForm = ref({
  isbn: '',
  title: '',
  volume_number: null,
  status: 'unread',
  acquired: true
})
const isbnCopied = ref(false)

const filteredMangas = computed(() => {
  if (!result.value) return mangas.value
  const seriesName = result.value.seriesName?.toLowerCase() || ''
  return mangas.value.filter(m =>
    m.title.toLowerCase().includes(seriesName) ||
    seriesName.includes(m.title.toLowerCase())
  )
})

const selectedMangaTitle = computed(() => {
  const manga = mangas.value.find(m => m.id === selectedMangaId.value)
  return manga?.title || ''
})

async function loadMangas() {
  mangas.value = await getMangas()
}

function tryAutoSelectManga() {
  if (!result.value || !result.value.seriesName) return

  const seriesName = result.value.seriesName.toLowerCase()

  const exactMatch = mangas.value.find(m => m.title.toLowerCase() === seriesName)
  if (exactMatch) {
    selectedMangaId.value = exactMatch.id
    autoMatchedId.value = exactMatch.id
    return
  }

  const partialMatch = mangas.value.find(m =>
    m.title.toLowerCase().includes(seriesName) ||
    seriesName.includes(m.title.toLowerCase())
  )
  if (partialMatch) {
    selectedMangaId.value = partialMatch.id
    autoMatchedId.value = partialMatch.id
  }
}

async function search() {
  if (!searchQuery.value.trim()) return

  searching.value = true
  error.value = ''
  result.value = null
  notFound.value = false
  addedSuccess.value = false
  selectedMangaId.value = null
  autoMatchedId.value = null
  showNewMangaForm.value = false
  showEditVolumeModal.value = false
  newMangaTitle.value = ''

  try {
    const data = await searchByISBN(searchQuery.value.trim())
    if (data) {
      result.value = data
      await loadMangas()
      tryAutoSelectManga()

      if (filteredMangas.value.length === 0 && result.value.seriesName) {
        newMangaTitle.value = result.value.seriesName
      }
    } else {
      notFound.value = true
    }
  } catch (err) {
    error.value = err.message || 'Error searching. Please try again.'
  } finally {
    searching.value = false
  }
}

async function createAndSelect() {
  if (!newMangaTitle.value.trim()) return

  try {
    const mangaData = { title: newMangaTitle.value.trim() }
    if (result.value) {
      if (result.value.author) mangaData.author = result.value.author.join(', ')
      if (result.value.publisher) mangaData.publisher = result.value.publisher
      if (result.value.cover_url) mangaData.cover_url = result.value.cover_url
    }
    const manga = await createManga(mangaData)
    mangas.value.unshift(manga)
    selectedMangaId.value = manga.id
    autoMatchedId.value = manga.id
    showNewMangaForm.value = false
    await addVolumeToSelected()
  } catch (err) {
    error.value = err.message || 'Error creating manga'
  }
}

function openEditVolumeModal() {
  if (!result.value) return
  editVolumeForm.value = {
    isbn: result.value.isbn || '',
    title: result.value.title || '',
    volume_number: result.value.volumeNumber || null,
    status: 'unread',
    acquired: true
  }
  showEditVolumeModal.value = true
}

async function addVolumeToSelected() {
  if (!selectedMangaId.value || !result.value) return

  adding.value = true
  error.value = ''

  try {
    const data = showEditVolumeModal.value
      ? { ...editVolumeForm.value, cover_url: result.value.cover_url || null }
      : {
          isbn: result.value.isbn,
          title: result.value.title,
          volume_number: result.value.volumeNumber,
          status: 'unread',
          acquired: true,
          cover_url: result.value.cover_url || null
        }

    await apiAddVolume(selectedMangaId.value, data)
    showEditVolumeModal.value = false
    addedSuccess.value = true
  } catch (err) {
    error.value = err.message || 'Error adding volume'
  } finally {
    adding.value = false
  }
}

async function copyIsbn() {
  if (result.value?.isbn) {
    try {
      await navigator.clipboard.writeText(result.value.isbn)
      isbnCopied.value = true
      setTimeout(() => {
        isbnCopied.value = false
      }, 2000)
    } catch (err) {
      console.warn('Failed to copy ISBN:', err)
    }
  }
}

function reset() {
  searchQuery.value = ''
  result.value = null
  notFound.value = false
  addedSuccess.value = false
  selectedMangaId.value = null
  autoMatchedId.value = null
  showNewMangaForm.value = false
  showEditVolumeModal.value = false
  newMangaTitle.value = ''
  isbnCopied.value = false
  editVolumeForm.value = {
    isbn: '',
    title: '',
    volume_number: null,
    status: 'unread',
    acquired: true
  }
}

onMounted(() => {
  loadMangas()
})
</script>

<style scoped>
.search-header {
  text-align: center;
  margin-bottom: 32px;
}

.search-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.search-header p {
  color: var(--text-secondary);
}

.search-controls {
  max-width: 600px;
  margin: 0 auto 32px;
}

.search-form {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto 48px;
}

.search-form :deep(.search-input-wrapper) {
  flex: 1;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(230, 57, 70, 0.1);
  border-radius: 8px;
  color: var(--accent);
  max-width: 600px;
  margin: 0 auto;
}

.error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.result-card {
  display: flex;
  gap: 24px;
  max-width: 700px;
  margin: 0 auto 32px;
  padding: 24px;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow);
}

.result-cover {
  flex-shrink: 0;
}

.result-cover img {
  width: 120px;
  border-radius: 6px;
}

.cover-placeholder {
  width: 120px;
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-family: 'Noto Serif JP', serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-secondary);
}

.result-info {
  flex: 1;
}

.result-info h2 {
  font-size: 20px;
  margin-bottom: 4px;
}

.author {
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.result-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}

.volume-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--accent);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
  margin-top: 4px;
}

.source-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.source-badge.openlibrary {
  background: rgba(230, 57, 70, 0.15);
  color: var(--accent);
}

.source-badge.google {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.series-hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.series-hint strong {
  color: var(--text-primary);
}

.openlibrary-contribution {
  max-width: 600px;
  margin: 0 auto 32px;
  padding: 20px;
  background: rgba(230, 57, 70, 0.08);
  border: 1px solid rgba(230, 57, 70, 0.2);
  border-radius: 12px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.contribution-icon {
  flex-shrink: 0;
  color: var(--accent);
}

.contribution-content {
  flex: 1;
}

.contribution-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.contribution-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-style: italic;
}

.contribution-text {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.contribution-warning {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.4;
  font-style: italic;
}

.contribution-isbn {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.contribution-isbn code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(0,0,0,0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.copy-isbn-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px;
  margin-left: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  vertical-align: middle;
}

.copy-isbn-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.contribution-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-weight: 500;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 8px;
}

.contribution-link:hover {
  text-decoration: underline;
}

.contribution-credit {
  font-size: 11px;
  color: var(--text-secondary);
  font-style: italic;
}

.manga-selector {
  max-width: 600px;
  margin: 0 auto;
}

.manga-selector h3 {
  font-size: 16px;
  margin-bottom: 16px;
  text-align: center;
  color: var(--text-secondary);
}

.manga-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.manga-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  flex-wrap: wrap;
}

.manga-option:hover {
  border-color: var(--accent);
}

.manga-option.selected {
  border-color: var(--accent);
  background: rgba(230, 57, 70, 0.05);
}

.manga-option.auto-matched {
  border-color: var(--success);
}

.manga-thumb {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
}

.manga-thumb-placeholder {
  width: 40px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-weight: 700;
  color: var(--text-secondary);
}

.manga-option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.manga-option-title {
  font-weight: 500;
}

.manga-option-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.check-icon {
  width: 20px;
  height: 20px;
  color: var(--accent);
}

.auto-match-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(45, 106, 79, 0.15);
  color: var(--success);
  border: 1px solid var(--success);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  flex-basis: 100%;
  width: fit-content;
}

.auto-match-badge svg {
  width: 14px;
  height: 14px;
  stroke-width: 2.5;
}

.no-matches {
  text-align: center;
  color: var(--text-secondary);
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 16px;
}

.new-manga-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  margin-bottom: 16px;
}

.new-manga-toggle:hover {
  color: var(--accent);
}

.new-manga-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.new-manga-form input {
  flex: 1;
}

.add-volume-actions {
  display: flex;
  justify-content: center;
}

.auto-match-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.edit-volume-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.checkbox-group label {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
}

.btn-lg {
  padding: 14px 28px;
  font-size: 16px;
}

.not-found {
  text-align: center;
  padding: 64px 24px;
}

.not-found svg {
  width: 64px;
  height: 64px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.not-found h2 {
  font-size: 20px;
  margin-bottom: 8px;
}

.not-found p {
  color: var(--text-secondary);
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 24px;
  background: rgba(45, 106, 79, 0.1);
  border-radius: 12px;
  color: var(--success);
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.success-message svg {
  width: 48px;
  height: 48px;
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .result-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .new-manga-form {
    flex-direction: column;
  }

  .auto-match-actions {
    flex-direction: column;
    width: 100%;
  }

  .auto-match-actions .btn {
    width: 100%;
  }
}
</style>