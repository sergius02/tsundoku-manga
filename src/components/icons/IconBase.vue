<template>
  <svg
    :viewBox="viewBox"
    fill="none"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :stroke-linecap="strokeLinecap"
    :stroke-linejoin="strokeLinejoin"
    :aria-hidden="ariaHidden"
    :class="['icon', `size-${size}`]"
  >
    <slot />
  </svg>
</template>

<script setup>
defineProps({
  viewBox: {
    type: String,
    default: '0 0 24 24',
  },
  stroke: {
    type: String,
    default: 'currentColor',
  },
  strokeWidth: {
    type: [Number, String],
    default: 2,
  },
  strokeLinecap: {
    type: String,
    default: 'round',
  },
  strokeLinejoin: {
    type: String,
    default: 'round',
  },
  ariaHidden: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value),
  },
})
</script>

<style scoped>
.icon {
  flex-shrink: 0;
}

.size-sm {
  width: 14px;
  height: 14px;
}

.size-md {
  width: 18px;
  height: 18px;
}

.size-lg {
  width: 24px;
  height: 24px;
}
</style>
