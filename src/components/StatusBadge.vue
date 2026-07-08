<script setup>
import { STATUSES } from '../data/constants'

defineProps({
  status: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'sm',
  },
})

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
}
</script>

<template>
  <span
    v-if="STATUSES[status]"
    class="inline-flex items-center rounded-full font-heading font-semibold uppercase tracking-wide whitespace-nowrap"
    :class="[STATUSES[status].color, sizeClasses[size]]"
  >
    {{ STATUSES[status].label }}
  </span>
</template>
