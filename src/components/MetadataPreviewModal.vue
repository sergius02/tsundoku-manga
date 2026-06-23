<template>
  <Modal
    :model-value="modelValue"
    :title="$t('volume.refreshMetadata')"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="metadata-modal-content">
      <div v-if="state === 'loading'" class="state-loading">
        <LoadingSpinner size="lg" />
        <p>{{ $t('volume.refreshMetadataSearching') }}</p>
      </div>

      <div v-else-if="state === 'notFound'" class="state-not-found">
        <div class="not-found-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="48"
            height="48"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p class="not-found-title">{{ $t('volume.refreshMetadataNotFound') }}</p>
        <p class="not-found-hint">{{ $t('volume.refreshMetadataNotFoundHint') }}</p>
      </div>

      <div v-else-if="state === 'upToDate'" class="state-up-to-date">
        <div class="up-to-date-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="48"
            height="48"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="8 12 11 15 16 9" />
          </svg>
        </div>
        <p class="up-to-date-title">{{ $t('volume.refreshMetadataUpToDate') }}</p>
        <div class="current-values">
          <div class="value-row">
            <span class="value-label">{{ $t('volume.title') }}:</span>
            <span class="value-current">{{ volume.title || '—' }}</span>
          </div>
          <div v-if="volume.cover_url" class="value-row">
            <span class="value-label">{{ $t('volume.cover') }}:</span>
            <img :src="volume.cover_url" alt="cover" class="value-cover" />
          </div>
        </div>
      </div>

      <div v-else-if="state === 'hasChanges'" class="state-has-changes">
        <div class="changes-preview">
          <div v-if="hasTitleChange" class="change-row">
            <label class="change-checkbox">
              <input v-model="selectedChanges.title" type="checkbox" />
              <span class="change-label">{{ $t('volume.title') }}</span>
            </label>
            <div class="change-values">
              <div class="change-old">
                <span class="change-tag">{{ $t('volume.currentValue') }}</span>
                <span class="change-text">{{ volume.title || '—' }}</span>
              </div>
              <svg
                class="arrow-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <div class="change-new">
                <span class="change-tag">{{ $t('volume.newValue') }}</span>
                <span class="change-text">{{ searchResult.title }}</span>
              </div>
            </div>
          </div>

          <div v-if="hasCoverChange" class="change-row">
            <label class="change-checkbox">
              <input v-model="selectedChanges.cover" type="checkbox" />
              <span class="change-label">{{ $t('volume.cover') }}</span>
            </label>
            <div class="change-values">
              <div class="change-old">
                <span class="change-tag">{{ $t('volume.currentValue') }}</span>
                <div class="cover-container">
                  <img v-if="volume.cover_url" :src="volume.cover_url" alt="current cover" />
                  <span v-else class="no-cover">—</span>
                </div>
              </div>
              <svg
                class="arrow-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <div class="change-new">
                <span class="change-tag">{{ $t('volume.newValue') }}</span>
                <div class="cover-container">
                  <img
                    v-if="searchResult.cover_url"
                    :src="searchResult.cover_url"
                    alt="new cover"
                  />
                  <span v-else class="no-cover">—</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="source-info">
          {{ $t('volume.refreshMetadataSource') }}
          <span class="source-badge" :class="searchResult.source">
            {{
              searchResult.source === 'openlibrary'
                ? $t('search.sourceOpenLibrary')
                : $t('search.sourceGoogle')
            }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-ghost" @click="close">
        {{ state === 'hasChanges' ? $t('common.cancel') : $t('common.close') }}
      </button>
      <button v-if="state === 'hasChanges'" class="btn btn-primary" @click="save">
        {{ $t('common.save') }}
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from './Modal.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { searchByISBN, searchByTitle } from '../api/index.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  volume: {
    type: Object,
    default: null,
  },
  mangaTitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const state = ref('loading')
const searchResult = ref(null)
const selectedChanges = ref({
  title: true,
  cover: true,
})

const hasTitleChange = computed(() => {
  if (!searchResult.value) return false
  const currentTitle = props.volume?.title || ''
  const newTitle = searchResult.value.title || ''
  return currentTitle !== newTitle
})

const hasCoverChange = computed(() => {
  if (!searchResult.value) return false
  const currentCover = props.volume?.cover_url || ''
  const newCover = searchResult.value.cover_url || ''
  return currentCover !== newCover
})

watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen && props.volume) {
      await searchMetadata()
    }
  }
)

async function searchMetadata() {
  state.value = 'loading'
  searchResult.value = null

  try {
    let result
    if (props.volume?.isbn) {
      result = await searchByISBN(props.volume.isbn)
    } else {
      const searchTitle = props.mangaTitle || props.volume?.title || ''
      const volumeNum = props.volume?.volume_number
      const fullTitle = volumeNum ? `${searchTitle} ${volumeNum}` : searchTitle
      result = await searchByTitle(fullTitle)
    }

    if (result?.notFound) {
      state.value = 'notFound'
      return
    }

    searchResult.value = result

    const titleChanged = hasTitleChange.value
    const coverChanged = hasCoverChange.value

    if (!titleChanged && !coverChanged) {
      state.value = 'upToDate'
    } else {
      selectedChanges.value = {
        title: titleChanged,
        cover: coverChanged,
      }
      state.value = 'hasChanges'
    }
  } catch (error) {
    console.error('Error searching metadata:', error)
    state.value = 'notFound'
  }
}

function save() {
  const data = {}
  if (selectedChanges.value.title && searchResult.value?.title) {
    data.title = searchResult.value.title
  }
  if (selectedChanges.value.cover && searchResult.value?.cover_url) {
    data.cover_url = searchResult.value.cover_url
  }
  emit('save', data)
  close()
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.metadata-modal-content {
  min-height: 200px;
}

.state-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 0;
  color: var(--text-secondary);
}

.state-loading p {
  font-size: 14px;
}

.state-not-found,
.state-up-to-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 0;
}

.not-found-icon {
  color: var(--accent);
  margin-bottom: 16px;
}

.not-found-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.not-found-hint {
  font-size: 14px;
  color: var(--text-secondary);
}

.up-to-date-icon {
  color: #22c55e;
  margin-bottom: 16px;
}

.up-to-date-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.current-values {
  width: 100%;
  max-width: 300px;
}

.value-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  text-align: left;
}

.value-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.value-current {
  font-size: 14px;
  color: var(--text-primary);
}

.value-cover {
  width: 100px;
  height: auto;
  border-radius: 4px;
  margin-top: 4px;
}

.state-has-changes {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.changes-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.change-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.change-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent);
}

.change-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.change-values {
  display: flex;
  align-items: center;
  gap: 12px;
}

.change-old,
.change-new {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.change-tag {
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.change-text {
  font-size: 14px;
  color: var(--text-primary);
  word-break: break-word;
}

.arrow-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.cover-container {
  width: 100px;
  height: 150px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  color: var(--text-secondary);
  font-size: 12px;
}

.source-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.source-badge {
  display: inline-flex;
  align-items: center;
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
</style>
