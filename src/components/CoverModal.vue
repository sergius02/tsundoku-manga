<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="$t('cover.changeCover') || 'Change Cover'">
    <div class="cover-modal-content">
      <div class="form-group">
        <input
          type="text"
          v-model="coverUrlInput"
          :placeholder="$t('cover.urlPlaceholder') || 'Image URL'"
          class="cover-url-input"
        />
      </div>
      <div class="volumes-grid">
        <button
          v-for="tomo in volumesWithCovers"
          :key="tomo.id"
          class="volume-cover-item"
          :class="{ selected: selectedVolumeId === tomo.id }"
          @click="selectVolume(tomo)"
        >
          <img
            v-if="getVolumeCover(tomo)"
            :src="getVolumeCover(tomo)"
            :alt="`Volume ${tomo.volume_number}`"
            loading="lazy"
          />
          <div v-else class="volume-placeholder">
            {{ tomo.volume_number || '?' }}
          </div>
          <span class="volume-number">Vol. {{ tomo.volume_number || '?' }}</span>
        </button>
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-ghost" @click="$emit('update:modelValue', false)">{{ $t('common.cancel') }}</button>
      <button type="button" class="btn btn-primary" @click="save">{{ $t('common.save') }}</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Modal from './Modal.vue'
import { getBookInfoByISBN } from '../api/covers.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  volumes: {
    type: Array,
    default: () => []
  },
  currentCoverUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const coverUrlInput = ref('')
const selectedVolumeId = ref(null)

const volumesWithCovers = computed(() => {
  return props.volumes.filter(v => v.cover_url)
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    coverUrlInput.value = props.currentCoverUrl || ''
    selectedVolumeId.value = null
  }
})

function getVolumeCover(tomo) {
  if (tomo.cover_url) return tomo.cover_url
  return null
}

function selectVolume(tomo) {
  const cover = getVolumeCover(tomo)
  if (cover) {
    selectedVolumeId.value = tomo.id
    coverUrlInput.value = cover
  }
}

function save() {
  emit('save', coverUrlInput.value)
}
</script>

<style scoped>
.cover-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  margin: 0;
}

.cover-url-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.cover-url-input:focus {
  outline: none;
  border-color: var(--accent);
}

.volumes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.volume-cover-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.volume-cover-item:hover {
  border-color: var(--border);
}

.volume-cover-item.selected {
  border-color: var(--accent);
}

.volume-cover-item img {
  width: 50px;
  height: 71px;
  object-fit: cover;
  border-radius: 3px;
}

.volume-placeholder {
  width: 50px;
  height: 71px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 3px;
  font-weight: 600;
  font-size: 12px;
  color: var(--text-secondary);
}

.volume-number {
  font-size: 11px;
  color: var(--text-secondary);
}
</style>