<template>
  <span :class="['status-badge', `status-${status}`]">
    <svg v-if="status === 'read'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
    <svg v-else-if="status === 'reading'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
    <svg v-else-if="status === 'unread'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
    <span>{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusMap = {
  unread: 'status.unread',
  reading: 'status.reading',
  read: 'status.read',
  no_volumes: 'status.noVolumes'
}

const label = computed(() => {
  const key = statusMap[props.status] || `status.${props.status}`
  return t(key)
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  width: fit-content;
}

.status-badge svg {
  width: 12px;
  height: 12px;
}

.status-read {
  background-color: rgba(45, 106, 79, 0.15);
  color: var(--success);
}

.status-reading {
  background-color: rgba(244, 162, 97, 0.2);
  color: #c77c02;
}

.status-unread {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.status-no_volumes {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}
</style>