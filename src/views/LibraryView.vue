<template>
  <div class="page-container">
    <div class="filters-bar">
      <div class="filter-group sort-only">
        <label class="filter-label">{{ $t('library.sort.label') }}</label>
        <select
          v-model="filters.sort"
          class="filter-select"
          @change="updateFilter('sort', filters.sort)"
        >
          <option value="title">
            {{ $t('library.sort.title') }}
          </option>
          <option value="progress">
            {{ $t('library.sort.progress') }}
          </option>
          <option value="date">
            {{ $t('library.sort.date') }}
          </option>
        </select>
      </div>
      <div class="filter-group search-group">
        <SearchInput
          v-model="searchQuery"
          :placeholder="$t('library.search.placeholder')"
          @update:model-value="debouncedSearch"
        />
      </div>
    </div>

    <div class="stats-bar" role="group" aria-label="Filter by status">
      <button
        class="stat filter-stat"
        :class="{ active: statusFilter === 'all', total: true }"
        :aria-pressed="statusFilter === 'all'"
        @click="toggleStatusFilter('all')"
      >
        <span class="stat-value">{{ store.mangas.length }}</span>
        <span class="stat-label">{{ $t('library.stats.total') }}</span>
      </button>
      <button
        class="stat filter-stat"
        :class="{ active: statusFilter === 'read', completed: true }"
        :aria-pressed="statusFilter === 'read'"
        @click="toggleStatusFilter('read')"
      >
        <span class="stat-value stat-completed">{{ completedCount }}</span>
        <span class="stat-label">{{ $t('library.stats.completed') }}</span>
      </button>
      <button
        class="stat filter-stat"
        :class="{ active: statusFilter === 'reading', reading: true }"
        :aria-pressed="statusFilter === 'reading'"
        @click="toggleStatusFilter('reading')"
      >
        <span class="stat-value stat-reading">{{ readingCount }}</span>
        <span class="stat-label">{{ $t('library.stats.reading') }}</span>
      </button>
    </div>

    <div v-if="store.loading" class="loading-grid">
      <div v-for="i in 8" :key="i" class="skeleton-card">
        <div class="skeleton skeleton-cover" />
        <div class="skeleton skeleton-text" />
        <div class="skeleton skeleton-text-sm" />
      </div>
    </div>

    <div v-else-if="filteredMangas.length === 0" class="empty-state">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <h2>{{ $t('library.empty') }}</h2>
      <p>{{ $t('library.emptyHint') }}</p>
      <router-link to="/search" class="btn btn-primary"> $t('library.searchManga') }} </router-link>
    </div>

    <div v-else class="manga-grid" @contextmenu.prevent="openContextMenu">
      <TransitionGroup name="manga-list">
        <div
          v-for="manga in filteredMangas"
          :key="manga.id"
          class="manga-card-wrapper"
          @contextmenu.prevent.stop="e => openContextMenu(e, manga)"
        >
          <MangaCard :manga="manga" @click="goToDetail(manga.id)" />
        </div>
      </TransitionGroup>
    </div>

    <ContextMenu
      ref="contextMenu"
      :manga="selectedManga"
      @view="viewManga"
      @edit="editManga"
      @mark-read="markAllAsRead"
      @mark-unread="markAllAsUnread"
      @delete="confirmDelete"
    />

    <Modal v-model="showEditModal" :title="$t('manga.editManga')">
      <form class="edit-form" @submit.prevent="saveEdit">
        <div class="form-group">
          <label>{{ $t('manga.title') }} *</label>
          <input v-model="editForm.title" type="text" required />
        </div>
        <div class="form-group">
          <label>{{ $t('manga.author') }}</label>
          <input v-model="editForm.author" type="text" />
        </div>
        <div class="form-group">
          <label>{{ $t('manga.publisher') }}</label>
          <input v-model="editForm.publisher" type="text" />
        </div>
        <div class="form-group">
          <label>{{ $t('manga.coverUrl') }}</label>
          <input v-model="editForm.cover_url" type="text" />
        </div>
        <div class="form-group">
          <label>{{ $t('manga.notes') }}</label>
          <textarea v-model="editForm.notes" rows="3" />
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-ghost" @click="showEditModal = false">
          {{ $t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" @click="saveEdit">
          {{ $t('common.save') }}
        </button>
      </template>
    </Modal>

    <ConfirmModal
      v-model="showConfirm"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      type="danger"
      @confirm="confirmConfig.onConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMangaStore } from '../stores/mangas.js'
import { markAllVolumesRead, markAllVolumesUnread } from '../api/index.js'
import MangaCard from '../components/MangaCard.vue'
import SearchInput from '../components/SearchInput.vue'
import ContextMenu from '../components/ContextMenu.vue'
import Modal from '../components/Modal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const { t } = useI18n()
const router = useRouter()
const store = useMangaStore()
const contextMenu = ref(null)

const filters = ref({
  sort: 'title',
})

const searchQuery = ref(store.filters.q)
let searchTimeout = null

const statusFilter = ref('all')

const selectedManga = ref(null)
const showEditModal = ref(false)
const editForm = ref({
  title: '',
  author: '',
  publisher: '',
  cover_url: '',
  notes: '',
})

const showConfirm = ref(false)
const confirmConfig = ref({
  title: '',
  message: '',
  onConfirm: () => {},
})

function toggleStatusFilter(status) {
  if (statusFilter.value === status) {
    statusFilter.value = 'all'
  } else {
    statusFilter.value = status
  }
}

const filteredMangas = computed(() => {
  let result = [...store.mangas]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      m =>
        m.title.toLowerCase().includes(query) ||
        (m.author && m.author.toLowerCase().includes(query))
    )
  }

  if (statusFilter.value !== 'all') {
    result = result.filter(m => {
      const total = m.volumes_total || 0
      const read = m.volumes_read || 0

      if (statusFilter.value === 'read') {
        return total > 0 && read === total
      }
      if (statusFilter.value === 'reading') {
        return read > 0 && read < total
      }
      if (statusFilter.value === 'unread') {
        return read === 0 && total > 0
      }
      if (statusFilter.value === 'no_volumes') {
        return total === 0
      }
      return true
    })
  }

  result.sort((a, b) => {
    if (filters.value.sort === 'title') {
      return a.title.localeCompare(b.title)
    }
    if (filters.value.sort === 'progress') {
      const aProgress = (a.volumes_read || 0) / (a.volumes_total || 1)
      const bProgress = (b.volumes_read || 0) / (b.volumes_total || 1)
      return bProgress - aProgress
    }
    return 0
  })

  return result
})

function openConfirm(title, message, onConfirm) {
  confirmConfig.value = { title, message, onConfirm }
  showConfirm.value = true
}

const completedCount = computed(
  () =>
    store.mangas.filter(m => {
      const total = m.volumes_total || 0
      const read = m.volumes_read || 0
      return total > 0 && read === total
    }).length
)

const readingCount = computed(
  () =>
    store.mangas.filter(m => {
      const read = m.volumes_read || 0
      return read > 0 && m.volumes_total > read
    }).length
)

function updateFilter(key, value) {
  filters.value[key] = value
}

function debouncedSearch(value) {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchQuery.value = value
  }, 300)
}

function goToDetail(id) {
  router.push(`/manga/${id}`)
}

function openContextMenu(event, manga) {
  selectedManga.value = manga
  contextMenu.value?.show(event)
}

function viewManga() {
  if (selectedManga.value) {
    router.push(`/manga/${selectedManga.value.id}`)
  }
  contextMenu.value?.close()
}

function editManga() {
  if (selectedManga.value) {
    editForm.value = {
      title: selectedManga.value.title || '',
      author: selectedManga.value.author || '',
      publisher: selectedManga.value.publisher || '',
      notes: selectedManga.value.notes || '',
      cover_url: selectedManga.value.cover_url || '',
    }
    showEditModal.value = true
  }
  contextMenu.value?.close()
}

async function markAllAsRead() {
  if (selectedManga.value) {
    try {
      await markAllVolumesRead(selectedManga.value.id)
      store.markAllVolumesReadLocal(selectedManga.value.id)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }
  contextMenu.value?.close()
}

async function markAllAsUnread() {
  if (selectedManga.value) {
    try {
      await markAllVolumesUnread(selectedManga.value.id)
      store.markAllVolumesUnreadLocal(selectedManga.value.id)
    } catch (err) {
      console.error('Error marking all as unread:', err)
    }
  }
  contextMenu.value?.close()
}

async function confirmDelete() {
  if (selectedManga.value) {
    openConfirm(
      t('common.delete'),
      t('manga.deleteConfirmText', { title: selectedManga.value.title }),
      async () => {
        await store.removeManga(selectedManga.value.id)
      }
    )
  }
  contextMenu.value?.close()
}

async function saveEdit() {
  if (selectedManga.value && editForm.value.title) {
    await store.editManga(selectedManga.value.id, editForm.value)
    showEditModal.value = false
  }
}

onMounted(() => {
  store.fetchMangas()
})
</script>

<style scoped>
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: nowrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--bg-card);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.search-group {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: stretch;
}

.search-group .search-input-wrapper {
  width: 100%;
}

.sort-only {
  flex-shrink: 0;
}

.stats-bar {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: var(--bg-card);
  border-radius: 8px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px var(--shadow);
}

.filter-stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-stat:hover {
  background: var(--bg-secondary);
}

.filter-stat.active {
  background: var(--bg-secondary);
}

.filter-stat.active.total {
  border-color: var(--accent);
}

.filter-stat.active.completed {
  border-color: var(--success);
}

.filter-stat.active.reading {
  border-color: #c77c02;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-value {
  font-family: 'Noto Serif JP', serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-completed {
  color: var(--success);
}

.stat-reading {
  color: #c77c02;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.manga-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: 1fr;
  gap: 24px;
  position: relative;
  min-height: 200px;
}

.manga-list-move {
  transition: transform 0.4s ease-out;
}

.manga-list-enter-active {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
}

.manga-list-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in;
  position: absolute;
}

.manga-list-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.manga-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.manga-list-leave-stagger {
  transition-delay: 0.1s;
}

.manga-card-wrapper {
  position: relative;
  display: flex;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px;
}

.skeleton-card {
  background: var(--bg-card);
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-cover {
  aspect-ratio: 2/3;
}

.skeleton-text {
  height: 16px;
  margin: 16px 16px 8px;
}

.skeleton-text-sm {
  height: 12px;
  margin: 0 16px 16px;
  width: 60%;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.edit-form {
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
}

@media (max-width: 640px) {
  .filters-bar {
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 12px;
    padding-bottom: 8px;
  }

  .filter-group {
    flex-shrink: 0;
  }

  .search-group {
    min-width: 200px;
  }

  .stats-bar {
    gap: 24px;
    padding: 12px 16px;
  }

  .stat-value {
    font-size: 20px;
  }

  .manga-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
}
</style>
