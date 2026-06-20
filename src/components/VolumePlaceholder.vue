<template>
  <div class="volume-placeholder" @click="$emit('click')" @contextmenu.prevent>
    <div class="cover-placeholder">
      <span class="cover-volume-num">Vol. {{ volumeNumber }}</span>
      <span class="cover-warning">{{ $t('volume.notRegistered') }}</span>
      <span class="add-text">{{ $t('volume.addMissing') }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  volumeNumber: {
    type: Number,
    required: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.volume-placeholder {
  cursor: pointer;
}

.cover-placeholder {
  width: 80px;
  height: 113px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: 4px;
  flex-shrink: 0;
}

.cover-volume-num {
  font-weight: 700;
  font-size: 16px;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
}

.cover-warning {
  font-size: 9px;
  color: var(--accent);
  text-align: center;
  line-height: 1.2;
}

.add-text {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.volume-placeholder:hover .add-text {
  color: var(--accent);
}
</style>
