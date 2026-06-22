<template>
  <div class="spinner" :class="`size-${size}`" />
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value),
  },
})
</script>

<style scoped>
.spinner {
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.size-sm {
  width: 16px;
  height: 16px;
}

.size-md {
  width: 24px;
  height: 24px;
}

.size-lg {
  width: 32px;
  height: 32px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
