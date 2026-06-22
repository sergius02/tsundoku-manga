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
        v-else-if="displayCover"
        :src="displayCover"
        :alt="displayTitle"
        @load="imageLoaded = true"
        @error="imageLoaded = true"
      />
      <div v-else class="cover-placeholder">
        {{ tomo.volume_number || '?' }}
      </div>
      <div class="indicators">
        <AcquiredIndicator :tomo="tomo" @toggle-acquired="$emit('toggle-acquired')" />
        <VolumeStatusOverlay :status="tomo.status" @toggle-status="$emit('toggle-status')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import VolumeStatusOverlay from './VolumeStatusOverlay.vue'
import AcquiredIndicator from './AcquiredIndicator.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { useCoverFetch } from '../composables/useCoverFetch.js'

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

const { displayTitle, displayCover, hasDirectCover, hasCoverUrl, imageLoaded, fetchBookInfo } =
  useCoverFetch(props)

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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  pointer-events: none;
  z-index: 1;
}

.volume-cover .indicators {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  z-index: 2;
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
</style>
