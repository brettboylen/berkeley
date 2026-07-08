<script setup>
defineProps({
  show: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
  },
})

const sizeClasses = {
  sm: 'w-16 h-20',
  md: 'w-24 h-32',
  lg: 'w-32 h-44',
}
</script>

<template>
  <div
    class="shrink-0 rounded-lg overflow-hidden bg-stone-200 border-2 border-stone-900/10 flex items-center justify-center"
    :class="sizeClasses[size]"
  >
    <img
      v-if="show.flier?.url && show.flier.mimeType?.startsWith('image/')"
      :src="show.flier.url"
      :alt="`${show.headliner} poster`"
      class="w-full h-full object-cover"
    />
    <div
      v-else-if="show.flier?.mimeType === 'application/pdf'"
      class="flex flex-col items-center justify-center text-stone-500 p-2 text-center"
    >
      <span class="text-2xl">PDF</span>
      <span class="text-[10px] font-heading uppercase mt-1">Poster</span>
    </div>
    <div
      v-else
      class="flex flex-col items-center justify-center text-stone-400 p-2 text-center bg-berkeley-green/10 w-full h-full"
    >
      <span class="font-display text-xl text-berkeley-green uppercase tracking-wide leading-none">
        {{ show.headliner.charAt(0) }}
      </span>
      <span class="text-[10px] font-heading uppercase mt-1">No poster</span>
    </div>
  </div>
</template>
