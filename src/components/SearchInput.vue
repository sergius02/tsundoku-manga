<template>
  <div class="search-input-wrapper">
    <IconSearch class="search-icon" />
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="search-input"
    />
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="clear-btn"
      type="button"
    >
      <IconClose />
    </button>
    <LoadingSpinner v-if="loading" size="sm" class="spinner" />
  </div>
</template>

<script setup>
import IconSearch from './icons/IconSearch.vue'
import IconClose from './icons/IconClose.vue'
import LoadingSpinner from './LoadingSpinner.vue'

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search...'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 38px;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  padding: 8px 40px 8px 40px;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--bg-card);
  color: var(--text-primary);
}

.clear-btn {
  position: absolute;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.spinner {
  position: absolute;
  right: 12px;
}
</style>
