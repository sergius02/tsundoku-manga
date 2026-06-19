<template>
  <span :class="['status-badge', `status-${status}`]">
    <IconCheck v-if="status === 'read'" />
    <IconClock v-else-if="status === 'reading'" />
    <IconCircle v-else-if="status === 'unread'" />
    <IconMinus v-else />
    <span>{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useStatus } from '../composables/useStatus.js'
import IconCheck from './icons/IconCheck.vue'
import IconCircle from './icons/IconCircle.vue'
import IconClock from './icons/IconClock.vue'
import IconMinus from './icons/IconMinus.vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const { statusLabel } = useStatus()
const label = computed(() => statusLabel(props.status))
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

.status-badge :deep(svg) {
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
