<template>
  <IconBase v-bind="$attrs">
    <circle cx="12" cy="12" r="10"/>
  </IconBase>
</template>

<script setup>
import IconBase from './IconBase.vue'
defineOptions({ inheritAttrs: false })
</script>
