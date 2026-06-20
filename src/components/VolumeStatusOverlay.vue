<template>
  <div
    class="status-overlay"
    :class="`status-${status}`"
    @click.stop="$emit('toggle-status')"
    :title="label"
  >
    <IconCheck v-if="status === 'read'" />
    <IconCircle v-else />
    <span class="status-text">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStatus } from '../composables/useStatus.js'
import IconCheck from './icons/IconCheck.vue'
import IconCircle from './icons/IconCircle.vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['unread', 'reading', 'read'].includes(value)
  }
})

defineEmits(['toggle-status'])

const { statusLabel } = useStatus()
const label = computed(() => statusLabel(props.status))
</script>

<style scoped>
.status-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  z-index: 2;
}

.status-overlay:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.status-overlay:active {
  transform: scale(0.98);
}

.status-overlay :deep(svg) {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.status-overlay.status-unread {
  background: rgba(128, 128, 128, 0.85);
  color: white;
}

.status-overlay.status-reading {
  background: rgba(244, 162, 97, 0.9);
  color: white;
}

.status-overlay.status-read {
  background: rgba(45, 106, 79, 0.9);
  color: white;
}

.status-overlay.status-unread:hover {
  background: rgba(100, 100, 100, 0.95);
}

.status-overlay.status-reading:hover {
  background: rgba(230, 145, 80, 0.95);
}

.status-overlay.status-read:hover {
  background: rgba(40, 95, 70, 0.95);
}
</style>
