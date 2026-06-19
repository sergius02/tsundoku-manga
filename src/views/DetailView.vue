<template>
  <div class="page-container">
    <div v-if="store.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn btn-primary" @click="store.fetchManga(route.params.id)">{{ $t('common.retry') }}</button>
    </div>

    <div v-else-if="store.currentManga" class="manga-detail">
      <div class="detail-header animate-in">
        <button class="back-btn" @click="router.push('/')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12,19 5,12 12,5"/>
          </svg>
          {{ $t('common.back') || 'Back' }}
        </button>
        <button class="btn btn-secondary" @click="showEditModal = true">{{ $t('common.edit') }}</button>
      </div>

      <div class="detail-content animate-in-cover">
        <div class="cover-section">
          <div class="cover-wrapper" @mouseenter="showCoverEdit = true" @mouseleave="showCoverEdit = false">
            <div class="cover-container">
              <Transition name="cover-fade">
                <img
                  v-if="coverUrl && !coverLoading"
                  :key="coverUrl"
                  :src="coverUrl"
                  :alt="store.currentManga.title"
                  class="cover"
                  loading="lazy"
                  decoding="async"
                  @load="imageLoaded = true"
                  @error="imageLoaded = true"
                />
                <div v-else-if="!coverLoading" class="cover-placeholder" :key="'placeholder'">
                  {{ initials }}
                </div>
                <div v-else class="cover-loading">
                  <div class="spinner-sm"></div>
                </div>
              </Transition>
            </div>
            <Transition name="fade">
              <button v-if="showCoverEdit" class="cover-edit-btn" @click="openCoverModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </button>
            </Transition>
          </div>
        </div>

        <div class="info-section">
          <h1 class="title">{{ store.currentManga.title }}</h1>
          <p v-if="store.currentManga.author" class="author">{{ store.currentManga.author }}</p>

          <div class="metadata">
            <div v-if="store.currentManga.publisher" class="meta-item">
              <span class="meta-label">{{ $t('manga.publisher') }}</span>
              <span class="meta-value">{{ store.currentManga.publisher }}</span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <span class="progress-text">{{ volumesRead }} / {{ volumesTotal }} {{ $t('library.stats.volumes') }}</span>
          </div>

          <div v-if="store.currentManga.notes" class="notes">
            <h3>{{ $t('manga.notes') }}</h3>
            <p>{{ store.currentManga.notes }}</p>
          </div>
        </div>
      </div>

      <div class="volumes-section animate-in" style="animation-delay: 0.2s">
        <div class="volumes-header">
          <h2>{{ $t('manga.volumes') }}</h2>
          <div class="volumes-controls">
            <button class="btn btn-primary" @click="showAddVolumeModal = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {{ $t('volume.addVolume') }}
            </button>
          </div>
        </div>

        <Transition name="view-switch" mode="out-in">
          <div
            v-if="store.currentManga.volumes?.length > 0 || missingVolumeNumbers.length > 0"
            :key="'volumes'"
            class="volumes-list grid-view"
          >
            <template v-for="(volume, index) in volumesWithGaps" :key="volume.id">
              <VolumePlaceholder
                v-if="volume.placeholder"
                :volume-number="volume.volume_number"
                class="volume-item-animate"
                :style="{ animationDelay: (0.3 + index * 0.05) + 's' }"
                @click="openAddMissingVolume(volume.volume_number)"
              />
              <VolumeRow
                v-else
                :tomo="volume"
                :index="index"
                class="volume-item-animate"
                :style="{ animationDelay: (0.3 + index * 0.05) + 's' }"
                @toggle-status="cycleVolumeStatus(volume)"
                @toggle-acquired="toggleVolumeAcquired(volume)"
                @context-menu="(e) => openVolumeContextMenu(e, volume)"
              />
            </template>
          </div>
          <div v-else key="empty" class="empty-volumes">
            <p>{{ $t('manga.noVolumes') }}</p>
            <button class="btn btn-secondary" @click="showAddVolumeModal = true">{{ $t('manga.addFirstVolume') }}</button>
          </div>
        </Transition>
      </div>

      <ContextMenu
        ref="volumeContextMenu"
        :manga="selectedVolume"
        :is-volume="true"
        @edit="editVolume"
        @delete="confirmDeleteVolume(selectedVolume)"
        @toggle-status="cycleVolumeStatus(selectedVolume)"
        @toggle-acquired="toggleVolumeAcquired(selectedVolume)"
      />

      <div class="danger-zone">
        <button class="btn btn-ghost delete-btn" @click="confirmDelete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
          </svg>
          {{ $t('manga.deleteManga') }}
        </button>
      </div>
    </div>

    <Modal v-model="showEditModal" :title="$t('manga.editManga') || 'Edit manga'">
      <form @submit.prevent="saveEdit" class="edit-form">
        <div class="form-group">
          <label>{{ $t('manga.title') }} *</label>
          <input type="text" v-model="editForm.title" required />
        </div>
        <div class="form-group">
          <label>{{ $t('manga.author') }}</label>
          <input type="text" v-model="editForm.author" />
        </div>
        <div class="form-group">
          <label>{{ $t('manga.publisher') }}</label>
          <input type="text" v-model="editForm.publisher" />
        </div>
        <div class="form-group">
          <label>{{ $t('manga.coverUrl') }}</label>
          <input type="text" v-model="editForm.cover_url" />
        </div>
        <div class="form-group">
          <label>{{ $t('manga.notes') }}</label>
          <textarea v-model="editForm.notes" rows="3"></textarea>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-ghost" @click="showEditModal = false">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary" @click="saveEdit">{{ $t('common.save') }}</button>
      </template>
    </Modal>

    <Modal v-model="showAddVolumeModal" :title="$t('volume.addVolume')">
      <form @submit.prevent="addVolume" class="add-volume-form">
        <div class="form-group">
          <label>{{ $t('volume.isbn') }}</label>
          <input type="text" v-model="volumeForm.isbn" placeholder="978-4-1234-5678-9" />
        </div>
        <div class="form-group">
          <label>{{ $t('volume.volumeNumber') }}</label>
          <input type="number" v-model.number="volumeForm.volume_number" min="1" />
        </div>
        <div class="form-group">
          <label>{{ $t('volume.status') }}</label>
          <select v-model="volumeForm.status">
            <option value="unread">{{ $t('status.unread') }}</option>
            <option value="reading">{{ $t('status.reading') }}</option>
            <option value="read">{{ $t('status.read') }}</option>
          </select>
        </div>
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="volumeForm.acquired" />
            {{ $t('volume.acquired') }}
          </label>
        </div>
        <div class="form-group">
          <label>{{ $t('volume.coverUrl') }}</label>
          <input type="text" v-model="volumeForm.cover_url" />
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-ghost" @click="showAddVolumeModal = false">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary" @click="addVolume">{{ $t('common.add') }}</button>
      </template>
    </Modal>

    <Modal v-model="showEditVolumeModal" :title="$t('volume.editVolume')">
      <form @submit.prevent="saveEditVolume" class="edit-volume-form">
        <div class="form-group">
          <label>{{ $t('volume.isbn') }}</label>
          <input type="text" v-model="editVolumeForm.isbn" />
        </div>
        <div class="form-group">
          <label>{{ $t('volume.volumeNumber') }}</label>
          <input type="number" v-model.number="editVolumeForm.volume_number" min="1" />
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
        <div class="form-group">
          <label>{{ $t('volume.coverUrl') }}</label>
          <input type="text" v-model="editVolumeForm.cover_url" />
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-ghost" @click="showEditVolumeModal = false">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn btn-primary" @click="saveEditVolume">{{ $t('common.save') }}</button>
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

    <CoverModal
      v-model="showCoverModal"
      :volumes="store.currentManga?.volumes || []"
      :current-cover-url="store.currentManga?.cover_url || ''"
      @save="saveCover"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMangaStore } from '../stores/mangas.js'
import { addVolume as apiAddVolume, updateVolume, deleteVolume as apiDeleteVolume } from '../api/index.js'
import { getCoverByISBN } from '../api/covers.js'
import { useSeo } from '../composables/useSeo.js'
import VolumeRow from '../components/VolumeRow.vue'
import VolumePlaceholder from '../components/VolumePlaceholder.vue'
import Modal from '../components/Modal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import ContextMenu from '../components/ContextMenu.vue'
import CoverModal from '../components/CoverModal.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useMangaStore()

const showEditModal = ref(false)
const showAddVolumeModal = ref(false)
const showEditVolumeModal = ref(false)
const showConfirm = ref(false)
const showCoverModal = ref(false)
const showCoverEdit = ref(false)
const coverUrl = ref(null)
const coverLoading = ref(false)
const imageLoaded = ref(false)
const selectedVolume = ref(null)
const volumeContextMenu = ref(null)
const confirmConfig = ref({
  title: '',
  message: '',
  onConfirm: () => {}
})

function openConfirm(title, message, onConfirm) {
  confirmConfig.value = { title, message, onConfirm }
  showConfirm.value = true
}

const editForm = ref({
  title: '',
  author: '',
  publisher: '',
  cover_url: '',
  notes: ''
})

const volumeForm = ref({
  isbn: '',
  volume_number: null,
  status: 'unread',
  acquired: false,
  cover_url: ''
})

const editVolumeForm = ref({
  isbn: '',
  volume_number: null,
  status: 'unread',
  acquired: false,
  cover_url: ''
})

const initials = computed(() => {
  if (!store.currentManga?.title) return ''
  return store.currentManga.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

const volumesTotal = computed(() => store.currentManga?.volumes?.length || 0)
const volumesRead = computed(() => store.currentManga?.volumes?.filter(t => t.status === 'read').length || 0)
const progressPercent = computed(() => {
  if (volumesTotal.value === 0) return 0
  return Math.round((volumesRead.value / volumesTotal.value) * 100)
})

const missingVolumeNumbers = computed(() => {
  const volumes = store.currentManga?.volumes || []
  const numbers = volumes
    .map(v => v.volume_number)
    .filter(n => n != null)
    .sort((a, b) => a - b)

  if (numbers.length < 2) return []

  const gaps = []
  for (let i = 0; i < numbers.length - 1; i++) {
    const current = numbers[i]
    const next = numbers[i + 1]
    for (let n = current + 1; n < next; n++) {
      gaps.push(n)
    }
  }
  return gaps
})

const volumesWithGaps = computed(() => {
  const placeholders = missingVolumeNumbers.value.map(num => ({
    id: `placeholder-${num}`,
    volume_number: num,
    placeholder: true
  }))

  return [...store.currentManga.volumes, ...placeholders]
    .sort((a, b) => {
      const aNum = a.volume_number ?? 999999
      const bNum = b.volume_number ?? 999999
      return aNum - bNum
    })
})

const seoTitle = computed(() => store.currentManga?.title || '')
const seoDescription = computed(() => {
  if (!store.currentManga) return ''
  const author = store.currentManga.author ? ` by ${store.currentManga.author}` : ''
  const volumes = store.currentManga.volumes?.length || 0
  return `${store.currentManga.title}${author} - ${volumes} volumes in collection`
})

useSeo({
  title: seoTitle.value,
  description: seoDescription.value,
  ogImage: coverUrl.value,
  watch: [seoTitle, seoDescription, coverUrl]
})

async function fetchCover() {
  if (store.currentManga?.cover_url) {
    coverUrl.value = store.currentManga.cover_url
    coverLoading.value = false
    imageLoaded.value = true
    return
  }

  const isbn = store.currentManga?.volumes?.[0]?.isbn
  if (!isbn) {
    coverLoading.value = false
    coverUrl.value = null
    return
  }

  imageLoaded.value = false
  coverLoading.value = true
  try {
    coverUrl.value = await getCoverByISBN(isbn)
  } finally {
    coverLoading.value = false
  }
}

function populateEditForm() {
  if (store.currentManga) {
    editForm.value = {
      title: store.currentManga.title,
      author: store.currentManga.author || '',
      publisher: store.currentManga.publisher || '',
      cover_url: store.currentManga.cover_url || '',
      notes: store.currentManga.notes || ''
    }
  }
}

async function saveEdit() {
  await store.editManga(route.params.id, editForm.value)
  showEditModal.value = false
}

function openAddMissingVolume(volumeNumber) {
  volumeForm.value = {
    isbn: '',
    volume_number: volumeNumber,
    status: 'unread',
    acquired: true,
    cover_url: ''
  }
  showAddVolumeModal.value = true
}

async function addVolume() {
  const newVolume = await apiAddVolume(route.params.id, volumeForm.value)
  if (store.currentManga?.volumes) {
    store.currentManga.volumes.push(newVolume)
  }
  showAddVolumeModal.value = false
  volumeForm.value = { isbn: '', status: 'unread', acquired: false, cover_url: '' }
}

async function cycleVolumeStatus(volume) {
  const statusCycle = { unread: 'reading', reading: 'read', read: 'unread' }
  const newStatus = statusCycle[volume.status]
  await updateVolume(route.params.id, volume.id, { isbn: volume.isbn, status: newStatus, acquired: volume.acquired })
  store.updateVolumeState(volume.id, { status: newStatus })
}

async function toggleVolumeAcquired(volume) {
  const newAcquired = !volume.acquired
  await updateVolume(route.params.id, volume.id, { isbn: volume.isbn, status: volume.status, acquired: newAcquired })
  store.updateVolumeState(volume.id, { acquired: newAcquired })
}

async function deleteVolume(volume) {
  await apiDeleteVolume(route.params.id, volume.id)
  await store.fetchManga(route.params.id)
}

function openEditVolumeModal(volume) {
  selectedVolume.value = volume
  editVolumeForm.value = {
    isbn: volume.isbn || '',
    volume_number: volume.volume_number !== undefined ? volume.volume_number : null,
    status: volume.status || 'unread',
    acquired: volume.acquired === true || volume.acquired === 1,
    cover_url: volume.cover_url || ''
  }
  showEditVolumeModal.value = true
}

function openVolumeContextMenu(event, volume) {
  selectedVolume.value = volume
  volumeContextMenu.value?.show(event, volume)
}

function editVolume() {
  if (selectedVolume.value) {
    openEditVolumeModal(selectedVolume.value)
  }
  volumeContextMenu.value?.close()
}

async function saveEditVolume() {
  if (!selectedVolume.value) return

  const data = {}
  if (editVolumeForm.value.isbn !== '') data.isbn = editVolumeForm.value.isbn || null
  if (editVolumeForm.value.volume_number !== null) data.volume_number = editVolumeForm.value.volume_number
  data.status = editVolumeForm.value.status
  data.acquired = editVolumeForm.value.acquired
  if (editVolumeForm.value.cover_url !== '') data.cover_url = editVolumeForm.value.cover_url || null

  await updateVolume(route.params.id, selectedVolume.value.id, data)
  store.updateVolumeState(selectedVolume.value.id, data)
  showEditVolumeModal.value = false
}

async function confirmDeleteVolume(volume) {
  openConfirm(
    t('volume.delete'),
    t('volume.deleteConfirm'),
    async () => {
      await apiDeleteVolume(route.params.id, volume.id)
      await store.fetchManga(route.params.id)
    }
  )
}

async function confirmDelete() {
  openConfirm(
    t('manga.deleteManga'),
    t('manga.deleteConfirm'),
    async () => {
      await store.removeManga(route.params.id)
      router.push('/')
    }
  )
}

function openCoverModal() {
  showCoverModal.value = true
}

async function saveCover(url) {
  if (!url) return
  await store.editManga(route.params.id, { cover_url: url })
  coverUrl.value = url
  showCoverModal.value = false
}

watch(() => route.params.id, async () => {
  await store.fetchManga(route.params.id)
  await fetchCover()
})

watch(showEditModal, (val) => {
  if (val) populateEditForm()
})

watch(() => store.currentManga, () => {
  fetchCover()
})

onMounted(async () => {
  await store.fetchManga(route.params.id)
  await fetchCover()
})
</script>

<style scoped>
.loading, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-in {
  animation: slide-up 0.4s ease-out forwards;
}

.animate-in-cover {
  animation: slide-in-left 0.5s ease-out forwards;
}

.animate-slide-left {
  animation: slide-left 0.6s ease-out forwards;
}

@keyframes slide-left {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--text-primary);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.detail-content {
  display: flex;
  gap: 48px;
  margin-bottom: 48px;
}

.cover-section {
  flex-shrink: 0;
}

.cover-wrapper {
  position: relative;
  width: 280px;
  aspect-ratio: 2/3;
}

.cover-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.cover-container img,
.cover-container .cover-placeholder,
.cover-container .cover-loading {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 20px var(--shadow);
}

.cover-container .cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--border) 100%);
  font-family: 'Noto Serif JP', serif;
  font-size: 64px;
  font-weight: 700;
  color: var(--text-secondary);
}

.cover-container .cover-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--border) 100%);
}

.cover-edit-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background-color 0.2s;
}

.cover-edit-btn:hover {
  background: rgba(0, 0, 0, 0.85);
}

.cover-edit-btn svg {
  width: 24px;
  height: 24px;
}

.cover-fade-enter-active,
.cover-fade-leave-active {
  transition: opacity 0.3s ease;
}

.cover-fade-enter-from,
.cover-fade-leave-to {
  opacity: 0;
}

.info-section {
  flex: 1;
}

.title {
  font-size: 32px;
  line-height: 1.2;
  margin-bottom: 8px;
}

.author {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.meta-value {
  font-size: 14px;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}

.progress-section {
  margin-bottom: 32px;
}

.progress-bar {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.3s ease-out;
}

.progress-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.notes {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.notes h3 {
  font-size: 13px;
  margin-bottom: 8px;
}

.notes p {
  font-size: 14px;
  color: var(--text-secondary);
}

.volumes-section {
  margin-bottom: 48px;
}

.volumes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.volumes-header h2 {
  font-size: 20px;
}

.volumes-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volumes-list.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.volumes-list.grid-view :deep(.volume-row) {
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.volumes-list.grid-view :deep(.volume-cover) {
  grid-row: 1;
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
}

.volumes-list.grid-view :deep(.volume-actions) {
  grid-row: 2;
  display: flex;
  width: 100%;
}

.volumes-list.grid-view :deep(.volume-cover img),
.volumes-list.grid-view :deep(.volume-cover .cover-placeholder),
.volumes-list.grid-view :deep(.volume-cover .cover-loading) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.volumes-list.grid-view :deep(.volume-cover .status-overlay) {
  display: flex;
}

.volumes-list.grid-view :deep(.acquired-toggle) {
  flex: 1;
  border-radius: 0 0 8px 8px;
  border: none;
  border-top: 1px solid var(--border);
  height: 36px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.volumes-list.grid-view :deep(.acquired-toggle.acquired) {
  border-top-color: var(--accent);
}

.volumes-list.grid-view :deep(.volume-placeholder) {
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 8px;
  border: 2px dashed var(--accent);
}

.volumes-list.grid-view :deep(.volume-placeholder .cover-placeholder) {
  grid-row: 1;
  width: 100% !important;
  max-width: 100% !important;
  height: 100%;
  aspect-ratio: 2 / 3;
  flex-shrink: 0 !important;
  border-radius: 0;
  box-sizing: border-box;
}

.volumes-list.grid-view :deep(.volume-placeholder .actions) {
  grid-row: 2;
  display: flex;
  width: 100%;
}

.volumes-list.grid-view :deep(.volume-placeholder .cover-volume-num) {
  font-size: 22px;
}

.volumes-list.grid-view :deep(.volume-placeholder .cover-warning) {
  font-size: 14px;
}

.volumes-list.grid-view :deep(.volume-placeholder .add-btn) {
  flex: 1;
  border-radius: 0;
  border: none;
  border-top: 1px solid var(--accent);
  height: 36px;
}

.view-switch-enter-active,
.view-switch-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.view-switch-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.view-switch-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.volume-item-animate {
  opacity: 0;
  animation: slide-up 0.4s ease-out forwards;
}

.empty-volumes {
  text-align: center;
  padding: 48px 24px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.empty-volumes p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.danger-zone {
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.delete-btn {
  color: var(--accent);
}

.delete-btn:hover {
  background: rgba(230, 57, 70, 0.08);
}

.edit-form, .add-volume-form, .edit-volume-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.checkbox-group label {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .detail-content {
    flex-direction: column;
    align-items: center;
  }

  .cover-wrapper {
    width: 200px;
  }

  .title {
    font-size: 24px;
    text-align: center;
  }

  .author {
    text-align: center;
  }

  .metadata {
    justify-content: center;
  }
}
</style>