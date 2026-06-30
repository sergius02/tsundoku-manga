<template>
  <IconBase v-bind="$attrs">
    <line x1="11" y1="4" x2="11" y2="20" />
    <line x1="4" y1="11" x2="20" y2="11" />
  </IconBase>
</template>

<script setup>
import IconBase from './IconBase.vue'
defineOptions({ inheritAttrs: false })
</script>
