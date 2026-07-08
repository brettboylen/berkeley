<script setup>
import AppLogo from './AppLogo.vue'
import { VENUE } from '../data/venue'
</script>

<template>
  <footer class="mt-auto border-t-4 border-berkeley-red bg-stone-900 text-white">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="text-center sm:text-left">
          <div class="inline-block bg-white rounded-md px-3 py-2">
            <AppLogo variant="compact" />
          </div>
          <p class="mt-3 font-heading text-sm uppercase tracking-widest text-stone-400">
            428 S. Dawson · Raleigh, NC
          </p>
          <a
            :href="VENUE.instagramUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block mt-1 text-berkeley-green-light hover:text-white transition-colors font-heading text-sm uppercase tracking-wide"
          >
            {{ VENUE.instagramFollowLabel }}
          </a>
        </div>

        <div class="flex flex-wrap justify-center gap-3">
          <RouterLink
            to="/"
            class="font-heading text-sm uppercase tracking-wide text-stone-400 hover:text-white transition-colors"
          >
            Shows
          </RouterLink>
          <RouterLink
            to="/book"
            class="font-heading text-sm uppercase tracking-wide text-stone-400 hover:text-white transition-colors"
          >
            Book a Show
          </RouterLink>
          <RouterLink
            to="/contributor"
            class="font-heading text-sm uppercase tracking-wide text-stone-400 hover:text-white transition-colors"
          >
            Contributor View
          </RouterLink>
          <RouterLink
            to="/staff"
            class="font-heading text-sm uppercase tracking-wide text-stone-600 hover:text-stone-400 transition-colors"
          >
            Staff View
          </RouterLink>
        </div>
      </div>

      <p class="text-center text-xs text-stone-600 mt-8">
        Prototype — booking data stored in browser session only
      </p>
    </div>
  </footer>
</template>
