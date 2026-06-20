<template>
  <div
    class="acquired-indicator"
    :class="{ acquired: tomo.acquired }"
    @click.stop="$emit('toggle-acquired')"
    :title="tomo.acquired ? 'En mi posesión' : 'Marcar como en posesión'"
  >
    <IconCheck v-if="tomo.acquired" />
    <IconCircle v-else />
  </div>
</template>

<script setup>
import IconCheck from './icons/IconCheck.vue'
import IconCircle from './icons/IconCircle.vue'

defineProps({
  tomo: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle-acquired'])
</script>

<style scoped>
.acquired-indicator {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(128, 128, 128, 0.8);
  color: white;
  z-index: 2;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.acquired-indicator:hover {
  transform: scale(1.1);
}

.acquired-indicator.acquired {
  background: #2d6a4f;
}

.acquired-indicator.acquired:hover {
  background: #1b4332;
}

.acquired-indicator:not(.acquired):hover {
  background: rgba(100, 100, 100, 0.9);
}

.acquired-indicator :deep(svg) {
  width: 14px;
  height: 14px;
}
</style>
