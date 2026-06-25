<template>
  <div
    :class="['volume-row', `status-${tomo.status}`, { selected: isSelected }]"
    @click="handleClick"
    @contextmenu.prevent.stop="openContextMenu"
  >
    <div v-if="showCheckbox" class="volume-checkbox" @click.stop="toggleSelect">
      <input type="checkbox" :checked="isSelected" @change="toggleSelect" />
    </div>
    <div class="volume-cover" :class="{ unacquired: !tomo.acquired }" @click.stop>
      <div v-if="!imageLoaded && !hasDirectCover && hasCoverUrl" class="cover-loading">
        <LoadingSpinner size="sm" />
      </div>
      <img
        v-if="displayCover && !imageError"
        :src="displayCover"
        :alt="displayTitle"
        @load="imageLoaded = true"
        @error="imageError = true"
      />
      <div v-else class="cover-placeholder">
        <span class="placeholder-title">{{ placeholderText }}</span>
      </div>
      <span class="volume-number-label">
        {{ locale === 'es' ? `Tomo ${tomo.volume_number}` : `Vol. ${tomo.volume_number}` }}
      </span>
      <div class="indicators">
        <AcquiredIndicator :tomo="tomo" @toggle-acquired="$emit('toggle-acquired')" />
        <VolumeStatusOverlay :status="tomo.status" @toggle-status="$emit('toggle-status')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VolumeStatusOverlay from './VolumeStatusOverlay.vue'
import AcquiredIndicator from './AcquiredIndicator.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { useCoverFetch } from '../composables/useCoverFetch.js'

const { t, locale } = useI18n()

const props = defineProps({
  tomo: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
  showCheckbox: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'toggle-status',
  'toggle-acquired',
  'context-menu',
  'edit',
  'delete',
  'select',
])

const {
  displayTitle,
  displayCover,
  hasDirectCover,
  hasCoverUrl,
  imageLoaded,
  imageError,
  fetchBookInfo,
} = useCoverFetch(props)

const placeholderText = computed(() => {
  if (props.tomo.title) return props.tomo.title
  if (props.tomo.volume_number) {
    return locale.value === 'es'
      ? t('volume.fallbackTomo', { number: props.tomo.volume_number })
      : t('volume.fallbackVolume', { number: props.tomo.volume_number })
  }
  return '?'
})

function openContextMenu(event) {
  event.preventDefault()
  emit('context-menu', event)
}

function handleClick() {
  if (props.showCheckbox) {
    toggleSelect()
  } else {
    emit('toggle-status')
  }
}

function toggleSelect() {
  emit('select', props.tomo.id)
}

onMounted(() => {
  fetchBookInfo()
})
</script>

<style scoped>
.volume-row {
  position: relative;
}

.volume-row.selected {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-radius: 8px;
}

.volume-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

.volume-checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--accent);
}

.volume-cover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  pointer-events: none;
  z-index: 1;
}

.volume-cover .volume-number-label {
  position: absolute;
  bottom: 44px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 16px;
  color: white;
  z-index: 2;
  pointer-events: none;
}

.volume-cover .indicators {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  z-index: 3;
}

.volume-cover :deep(.acquired-indicator),
.volume-cover :deep(.status-overlay) {
  position: static;
  transform: none;
}

.volume-cover :deep(img),
.volume-cover :deep(.cover-placeholder) {
  transition: filter 0.5s ease;
}

.volume-cover.unacquired :deep(img),
.volume-cover.unacquired :deep(.cover-placeholder) {
  filter: grayscale(100%);
}

.volume-cover :deep(.cover-placeholder) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  aspect-ratio: 2 / 3;
  background: var(--bg-secondary);
  border-radius: 8px;
  flex-shrink: 0;
}

.placeholder-title {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 22px;
  color: var(--text-secondary);
  text-align: center;
  padding: 8px;
  word-break: break-word;
}
</style>
