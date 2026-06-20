<template>
  <Teleport to="body">
    <Transition name="fab">
      <div v-if="visible" class="fab-container">
        <div class="fab-content">
          <span class="fab-count">{{ count }} {{ count === 1 ? 'volume' : 'volumes' }}</span>
          <div class="fab-actions">
            <button class="fab-btn" @click="$emit('edit')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {{ $t('common.edit') }}
            </button>
            <button class="fab-btn fab-btn-danger" @click="$emit('delete')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {{ $t('common.delete') }}
            </button>
            <button class="fab-btn" @click="$emit('mark-read')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ $t('contextMenu.markAllRead') }}
            </button>
            <button class="fab-btn" @click="$emit('mark-unread')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
              </svg>
              {{ $t('contextMenu.markAllUnread') }}
            </button>
          </div>
          <button class="fab-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 0
  }
})

defineEmits(['edit', 'delete', 'mark-read', 'mark-unread', 'close'])
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: calc(100vw - 32px);
}

.fab-content {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 50px;
  padding: 12px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  flex-wrap: wrap;
  justify-content: center;
}

.fab-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  padding-right: 8px;
  border-right: 1px solid var(--border);
}

.fab-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.fab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.fab-btn:hover {
  background: var(--bg-hover);
}

.fab-btn svg {
  flex-shrink: 0;
}

.fab-btn-danger {
  color: var(--accent);
}

.fab-btn-danger:hover {
  background: rgba(230, 57, 70, 0.1);
}

.fab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 4px;
}

.fab-close:hover {
  background: var(--bg-secondary);
  color: var(--text);
}

.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s ease;
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(100px);
}

@media (max-width: 600px) {
  .fab-container {
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    max-width: none;
  }

  .fab-content {
    padding: 10px 12px;
    gap: 8px;
    border-radius: 16px;
  }

  .fab-count {
    width: 100%;
    text-align: center;
    padding-right: 0;
    padding-bottom: 8px;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .fab-actions {
    gap: 6px;
  }

  .fab-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .fab-btn svg {
    width: 16px;
    height: 16px;
  }

  .fab-close {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    background: var(--bg-card);
    border: 1px solid var(--border);
  }

  .fab-content {
    position: relative;
    padding-top: 20px;
  }
}
</style>
