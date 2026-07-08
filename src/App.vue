<script setup>
import { computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLogo from './components/AppLogo.vue'
import SiteFooter from './components/SiteFooter.vue'
import { VENUE } from './data/venue'

const route = useRoute()
const router = useRouter()

const navLinks = [
  { to: '/', label: 'Shows' },
  { to: '/book', label: 'Book a Show' },
  { to: '/contributor', label: 'Contributor View' },
]

const isHome = computed(() => route.path === '/')

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

async function goToShows() {
  if (route.path !== '/') {
    await router.push({ path: '/', query: { scroll: 'shows' } })
  } else {
    await router.replace({ path: '/', query: { scroll: 'shows' } })
  }
  await nextTick()
  setTimeout(() => {
    document.getElementById('shows-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 50)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-stone-100">
    <header class="bg-white border-b-4 border-berkeley-red shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-2.5 sm:py-3">
        <div class="flex items-center justify-between gap-3 sm:gap-4 min-h-[3.75rem] sm:min-h-[4.25rem]">
          <AppLogo variant="nav" />

          <p class="hidden md:block font-heading text-xs uppercase tracking-widest text-stone-500">
            428 S. Dawson · {{ VENUE.instagramLabel }}
          </p>

          <nav class="flex gap-1" aria-label="Main navigation">
            <RouterLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="px-3 py-2 rounded-full text-xs sm:text-sm font-heading font-semibold uppercase tracking-wide transition-colors"
              :class="isActive(link.to)
                ? 'bg-berkeley-red text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-berkeley-red'"
            >
              {{ link.label }}
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <section v-if="isHome" class="relative overflow-hidden bg-gingham">
      <div class="max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center">
        <div class="mx-auto flex w-full max-w-4xl items-center justify-center gap-3 sm:gap-6 md:gap-8">
          <img
            src="/assets/sunflowers/left-2.jpg"
            alt=""
            aria-hidden="true"
            class="shrink-0 size-16 sm:size-24 md:size-28 lg:size-32 rounded-sm object-cover object-center drop-shadow-md"
          />

          <img
            src="/assets/logo-transparent.png"
            alt="Berkeley Cafe"
            class="min-w-0 flex-1 sm:flex-none sm:w-60 md:w-72 lg:w-80 max-w-[11rem] sm:max-w-sm h-auto drop-shadow-lg"
          />

          <img
            src="/assets/sunflowers/left-1.jpg"
            alt=""
            aria-hidden="true"
            class="shrink-0 size-16 sm:size-24 md:size-28 lg:size-32 rounded-sm object-cover object-center drop-shadow-md"
          />
        </div>

        <div class="mt-6 flex flex-wrap gap-3 justify-center">
          <RouterLink to="/book" class="btn-primary">
            Book a Show
          </RouterLink>
          <button type="button" class="btn-secondary" @click="goToShows">
            View Shows
          </button>
        </div>
      </div>
    </section>

    <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-10">
      <RouterView />
    </main>

    <SiteFooter />
  </div>
</template>
