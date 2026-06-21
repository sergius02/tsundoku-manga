<template>
  <div class="manga-card" @click="$emit('click')">
    <div class="cover-wrapper">
      <div v-if="loading" class="cover-loading">
        <LoadingSpinner size="md" />
      </div>
      <img
        v-else-if="coverUrl"
        :src="coverUrl"
        :alt="manga.title"
        class="cover"
        loading="lazy"
        decoding="async"
        @load="imageLoaded = true"
        @error="onImageError"
      />
      <div v-else class="cover-placeholder">
        {{ initials }}
      </div>
      <div class="indicators">
        <VolumeStatusOverlay :status="overallStatus" :clickable="false" />
      </div>
    </div>
    <div class="info">
      <h3 class="title">{{ manga.title }}</h3>
      <p v-if="manga.author" class="author">{{ manga.author }}</p>
      <p v-if="progressText" class="progress">{{ progressText }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import VolumeStatusOverlay from './VolumeStatusOverlay.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { getCoverByISBN } from '../api/covers.js'

const { t } = useI18n()

const props = defineProps({
  manga: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const coverUrl = ref(null)
const loading = ref(false)
const imageLoaded = ref(false)

const initials = computed(() => {
  return props.manga.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
})

const overallStatus = computed(() => {
  const total = props.manga.volumes_total || 0
  const read = props.manga.volumes_read || 0

  if (total === 0) return 'no_volumes'
  if (read === total) return 'read'
  if (read > 0) return 'reading'
  return 'unread'
})

const progressText = computed(() => {
  const total = props.manga.volumes_total || 0
  const read = props.manga.volumes_read || 0
  if (total === 0) return t('status.noVolumes')
  return `${read} / ${total} ${t('status.read')}`
})

async function fetchCover() {
  imageLoaded.value = false

  if (props.manga.cover_url) {
    coverUrl.value = props.manga.cover_url
    loading.value = false
    return
  }

  const isbn = props.manga.first_volume_isbn
  if (!isbn) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    coverUrl.value = await getCoverByISBN(isbn)
  } finally {
    loading.value = false
  }
}

function onImageError() {
  coverUrl.value = null
}

onMounted(() => {
  fetchCover()
})
</script>

<style scoped>
.manga-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.25s ease-out, border-color 0.25s ease-out;
  box-shadow: 0 1px 3px var(--shadow);
  border: 2px solid transparent;
  height: 100%;
}

.manga-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(230, 57, 70, 0.15), 0 4px 12px var(--shadow);
}

.cover-wrapper {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  pointer-events: none;
  z-index: 1;
}

.cover-wrapper .indicators {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 2;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--border) 100%);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--border) 100%);
  font-family: 'Noto Serif JP', serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-secondary);
}

.info {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.author {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
