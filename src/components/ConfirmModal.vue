<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirm-overlay" @click.self="onCancel">
      <div class="confirm-modal">
        <div class="confirm-icon" :class="type">
          <IconWarning v-if="type === 'danger'" />
          <IconInfo v-else />
        </div>
        <h3 class="confirm-title">
          {{ title }}
        </h3>
        <p class="confirm-message">
          {{ message }}
        </p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" @click="onCancel">
            {{ cancelText }}
          </button>
          <button
            class="btn"
            :class="type === 'danger' ? 'btn-danger' : 'btn-primary'"
            @click="onConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import IconWarning from './icons/IconWarning.vue'
import IconInfo from './icons/IconInfo.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  type: {
    type: String,
    default: 'danger',
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.15s ease-out;
}

.confirm-modal {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.2s ease-out;
}

.confirm-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.confirm-icon.danger {
  background: rgba(230, 57, 70, 0.1);
  color: var(--accent);
}

.confirm-icon.info {
  background: rgba(244, 162, 97, 0.2);
  color: #c77c02;
}

.confirm-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.confirm-message {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-danger {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background: #d62839;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
