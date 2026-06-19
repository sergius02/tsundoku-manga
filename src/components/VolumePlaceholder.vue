<template>
  <div class="volume-placeholder" @click="$emit('click')" @contextmenu.prevent>
    <div class="cover-placeholder">
      <span class="cover-volume-num">Vol. {{ volumeNumber }}</span>
      <span class="cover-warning">{{ $t('volume.notRegistered') }}</span>
    </div>
    <div class="actions" @click.stop>
      <button class="add-btn" @click.stop="$emit('click')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ $t('volume.addMissing') }}
      </button>
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
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 2px dashed var(--accent);
  transition: background-color 0.2s;
}

.volume-placeholder:hover {
  background-color: var(--bg-secondary);
}

.cover-placeholder {
  position: relative;
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

.actions {
  display: flex;
  width: 100%;
}

.add-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(230, 57, 70, 0.1);
  border: none;
  border-top: 1px solid var(--accent);
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-btn:hover {
  background: rgba(230, 57, 70, 0.2);
}

.add-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
