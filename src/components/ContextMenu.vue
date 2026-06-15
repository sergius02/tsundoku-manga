<template>
  <Teleport to="body">
    <div v-if="visible" class="context-menu-overlay" @click="close" @contextmenu.prevent="close">
      <div
        class="context-menu"
        :style="menuStyle"
        @click.stop
        role="menu"
        aria-label="Context menu"
        ref="menuRef"
      >
        <div class="context-menu-header">
          <span class="context-menu-title">{{ displayTitle }}</span>
        </div>
        <template v-if="isTomo">
          <button class="menu-item" role="menuitem" @click="handleAction('edit')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ $t('common.edit') }}
          </button>
          <button class="menu-item" role="menuitem" @click="handleAction('toggle-status')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            {{ $t('contextMenu.markAsRead') }}
          </button>
          <button class="menu-item" role="menuitem" @click="handleAction('toggle-acquired')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ manga.acquired ? $t('volume.notAcquired') : $t('volume.acquired') }}
          </button>
          <div class="menu-divider" role="separator"></div>
          <button class="menu-item danger" role="menuitem" @click="handleAction('delete')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
            </svg>
            {{ $t('common.delete') }}
          </button>
        </template>
        <template v-else>
          <button class="menu-item" role="menuitem" @click="handleAction('view')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {{ $t('common.view') }}
          </button>
          <button class="menu-item" role="menuitem" @click="handleAction('edit')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ $t('common.edit') }}
          </button>
          <button v-if="isCompleted" class="menu-item" role="menuitem" @click="handleAction('mark-unread')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            {{ $t('contextMenu.markAllUnread') }}
          </button>
          <button v-else class="menu-item" role="menuitem" @click="handleAction('mark-read')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            {{ $t('contextMenu.markAsRead') }}
          </button>
          <div class="menu-divider" role="separator"></div>
          <button class="menu-item danger" role="menuitem" @click="handleAction('delete')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
            </svg>
            {{ $t('common.delete') }}
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps({
  manga: {
    type: Object,
    required: true
  },
  isTomo: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view', 'edit', 'mark-read', 'mark-unread', 'delete', 'toggle-status', 'toggle-acquired'])

const visible = ref(false)
const x = ref(0)
const y = ref(0)

const displayTitle = computed(() => {
  if (props.isTomo) {
    if (props.manga.title) return props.manga.title
    if (props.manga.volume_number) return `Volume ${props.manga.volume_number}`
    return 'Volume'
  }
  return props.manga.title
})

const isCompleted = computed(() => {
  const total = props.manga.volumes_total || 0
  const read = props.manga.volumes_read || 0
  return total > 0 && read === total
})

const menuStyle = computed(() => {
  const isMobile = window.innerWidth <= 640
  if (isMobile) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
  return { top: `${y.value}px`, left: `${x.value}px` }
})

const menuRef = ref(null)
const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function show(event, manga) {
  x.value = event.clientX
  y.value = event.clientY
  visible.value = true
}

function close() {
  visible.value = false
}

function handleAction(action) {
  emit(action)
  close()
}

function handleGlobalKeydown(e) {
  if (!visible.value) return

  if (e.key === 'Escape') {
    close()
    return
  }

  if (e.key === 'Tab' && menuRef.value) {
    const focusableElements = Array.from(menuRef.value.querySelectorAll(focusableSelectors))
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
}

watch(visible, async (isVisible) => {
  if (isVisible) {
    await nextTick()
    const firstItem = menuRef.value?.querySelector(focusableSelectors)
    if (firstItem) firstItem.focus()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

defineExpose({ show, close })
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.context-menu {
  position: fixed;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow);
  padding: 4px;
  min-width: 180px;
  z-index: 1001;
}

@media (max-width: 640px) {
  .context-menu {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 48px);
    max-width: 320px;
    animation: scale-in 0.2s ease-out;
  }

  .context-menu-overlay {
    background: rgba(0, 0, 0, 0.6);
  }
}

.context-menu-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}

.context-menu-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;
}

.menu-item:hover {
  background: var(--bg-secondary);
}

.menu-item svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.menu-item.danger {
  color: var(--accent);
}

.menu-item.danger svg {
  color: var(--accent);
}

.menu-item.danger:hover {
  background: rgba(230, 57, 70, 0.1);
}

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}
</style>