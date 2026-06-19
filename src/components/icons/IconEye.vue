<template>
  <IconBase v-bind="$attrs">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </IconBase>
</template>

<script setup>
import IconBase from './IconBase.vue'
defineOptions({ inheritAttrs: false })
</script>
