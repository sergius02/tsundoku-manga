<template>
  <div
    class="status-overlay"
    :class="`status-${status}`"
    @click.stop="$emit('toggle-status')"
    :title="statusLabel"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle v-if="status === 'unread'" cx="12" cy="12" r="10"/>
      <circle v-else-if="status === 'reading'" cx="12" cy="12" r="10"/>
      <path v-else-if="status === 'read'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline v-if="status === 'read'" points="22 4 12 14.01 9 11.01"/>
    </svg>
    <span class="status-text">{{ statusLabel }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['unread', 'reading', 'read'].includes(value)
  }
})

defineEmits(['toggle-status'])

const { t } = useI18n()

const statusLabel = computed(() => {
  const labels = {
    unread: t('status.unread'),
    reading: t('status.reading'),
    read: t('status.read')
  }
  return labels[props.status] || props.status
})
</script>

<style scoped>
.status-overlay {
  position: absolute;
  bottom: 12px;
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
  z-index: 1;
}

.status-overlay:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.status-overlay:active {
  transform: scale(0.98);
}

.status-overlay svg {
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
