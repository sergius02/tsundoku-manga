<template>
  <div
    :class="['volume-row', `status-${tomo.status}`]"
    @click="$emit('toggle-status')"
    @contextmenu.prevent.stop="openContextMenu"
  >
    <div class="volume-cover" @click.stop="$emit('toggle-status')">
      <div v-if="!imageLoaded && !hasDirectCover && hasCoverUrl" class="cover-loading">
        <div class="spinner-sm"></div>
      </div>
      <img
        v-else-if="displayCover"
        :src="displayCover"
        :alt="displayTitle"
        @load="imageLoaded = true"
        @error="imageLoaded = true"
      />
      <div v-else class="cover-placeholder">
        {{ tomo.volume_number || '?' }}
      </div>
    </div>
    <div class="volume-info">
      <span class="volume-title">{{ displayTitle }}</span>
      <span v-if="displayAuthor" class="volume-author">{{ displayAuthor }}</span>
      <StatusBadge :status="tomo.status" />
    </div>
    <div class="volume-actions" @click.stop>
      <button
        class="acquired-toggle"
        :class="{ acquired: tomo.acquired }"
        @click="$emit('toggle-acquired')"
        :title="tomo.acquired ? $t('volume.acquired') : $t('volume.notAcquired')"
      >
        <svg v-if="tomo.acquired" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span v-if="tomo.acquired" class="acquired-text">{{ $t('volume.inLibrary') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { getBookInfoByISBN } from '../api/covers.js'

const props = defineProps({
  tomo: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-status', 'toggle-acquired', 'context-menu', 'edit', 'delete'])

const bookInfo = ref(null)
const loading = ref(false)
const imageLoaded = ref(false)

watch(() => props.tomo.id, () => {
  imageLoaded.value = !!props.tomo.cover_url
  bookInfo.value = null
})

const displayTitle = computed(() => {
  if (props.tomo.title) return props.tomo.title
  if (props.tomo.volume_number) return `Volume ${props.tomo.volume_number}`
  if (bookInfo.value?.title) return bookInfo.value.title
  return `Volume ${props.index + 1}`
})

const hasDirectCover = computed(() => !!props.tomo.cover_url)

const displayAuthor = computed(() => {
  if (props.tomo.author) return props.tomo.author
  if (bookInfo.value?.author) return bookInfo.value.author.join(', ')
  return null
})

const hasCoverUrl = computed(() => {
  return props.tomo.cover_url || bookInfo.value?.cover_url
})

watch(bookInfo, (newVal) => {
  if (newVal?.cover_url) {
    imageLoaded.value = true
  }
})

const displayCover = computed(() => {
  if (props.tomo.cover_url) return props.tomo.cover_url
  if (bookInfo.value?.cover_url) return bookInfo.value.cover_url
  return null
})

async function fetchBookInfo() {
  if (!props.tomo.isbn) return

  loading.value = true
  try {
    bookInfo.value = await getBookInfoByISBN(props.tomo.isbn)
  } finally {
    loading.value = false
  }
}

function openContextMenu(event) {
  event.preventDefault()
  emit('context-menu', event)
}

onMounted(() => {
  fetchBookInfo()
})

onUnmounted(() => {
})
</script>

<style scoped>
.volume-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.volume-row:hover {
  background-color: var(--bg-secondary);
}

.volume-cover {
  flex-shrink: 0;
}

.volume-cover img {
  width: 80px;
  height: 113px;
  object-fit: cover;
  border-radius: 4px;
}

.cover-loading {
  width: 80px;
  height: 113px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.cover-placeholder {
  width: 80px;
  height: 113px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-weight: 700;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
}

.volume-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.volume-title {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.volume-author {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.volume-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.acquired-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.acquired-toggle:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.acquired-toggle.acquired {
  background: rgba(230, 57, 70, 0.15);
  border-color: var(--accent);
  color: var(--accent);
}

.acquired-toggle svg {
  width: 18px;
  height: 18px;
}

.acquired-toggle .acquired-text {
  font-size: 12px;
  font-weight: 500;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>