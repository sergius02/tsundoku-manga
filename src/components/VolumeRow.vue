<template>
  <div
    :class="['volume-row', `status-${tomo.status}`, { selected: isSelected }]"
    @click="handleClick"
    @contextmenu.prevent.stop="openContextMenu"
  >
    <div v-if="showCheckbox" class="volume-checkbox" @click.stop="toggleSelect">
      <input type="checkbox" :checked="isSelected" @change="toggleSelect" />
    </div>
    <div class="volume-cover" @click.stop="$emit('toggle-status')">
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
      <VolumeStatusOverlay
        :status="tomo.status"
        @toggle-status="$emit('toggle-status')"
      />
    </div>
    <div class="volume-actions" @click.stop>
      <button
        class="acquired-toggle"
        :class="{ acquired: tomo.acquired }"
        @click="$emit('toggle-acquired')"
        :title="tomo.acquired ? $t('volume.acquired') : $t('volume.notAcquired')"
      >
        <Transition name="fade" mode="out-in">
          <span v-if="tomo.acquired" key="acquired" class="acquired-content">
            <IconCheck />
            <span class="acquired-text">{{ $t('volume.inLibrary') }}</span>
          </span>
          <span v-else key="not-acquired" class="acquired-content">
            <IconCircle />
            <span class="acquired-text">{{ $t('volume.notAcquired') }}</span>
          </span>
        </Transition>
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import VolumeStatusOverlay from './VolumeStatusOverlay.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import IconCheck from './icons/IconCheck.vue'
import IconCircle from './icons/IconCircle.vue'
import { useCoverFetch } from '../composables/useCoverFetch.js'

const props = defineProps({
  tomo: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  },
  showCheckbox: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-status', 'toggle-acquired', 'context-menu', 'edit', 'delete', 'select'])

const { displayTitle, displayCover, hasDirectCover, hasCoverUrl, imageLoaded, fetchBookInfo } = useCoverFetch(props)

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

.volume-cover :deep(.status-overlay) {
  display: none;
}

.acquired-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.acquired-toggle:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.acquired-toggle.acquired {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.acquired-toggle.acquired:hover {
  background: #c13b4a;
  color: white;
}

.acquired-toggle :deep(svg) {
  width: 18px;
  height: 18px;
}

.acquired-toggle .acquired-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.acquired-toggle .acquired-text {
  font-size: 12px;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
