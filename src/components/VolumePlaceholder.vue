<template>
  <div class="volume-placeholder" @click="$emit('click')" @contextmenu.prevent>
    <div class="cover-placeholder">
      ?
    </div>
    <div class="info">
      <span class="title">Volume {{ volumeNumber }}</span>
      <span class="warning">{{ $t('volume.notRegistered') }}</span>
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
  width: 45px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-weight: 700;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  flex-shrink: 0;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.title {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.warning {
  font-size: 12px;
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(230, 57, 70, 0.1);
  border: 1px solid var(--accent);
  border-radius: 4px;
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
