<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'nav', 'compact'].includes(v),
  },
})

const sizeClasses = {
  default: 'h-16 sm:h-20',
  nav: 'max-h-14 sm:max-h-16 md:max-h-[4.75rem] h-auto',
  compact: 'h-10 sm:h-11',
}

const logoSrc = {
  default: '/assets/logo-transparent.png',
  nav: '/assets/logo-nav.png',
  compact: '/assets/logo-transparent.png',
}
</script>

<template>
  <RouterLink to="/" class="inline-block shrink-0 leading-none group">
    <img
      :src="logoSrc[variant]"
      alt="Berkeley Cafe"
      :class="[sizeClasses[variant], 'block w-auto group-hover:opacity-90 transition-opacity']"
    />
  </RouterLink>
</template>
