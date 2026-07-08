<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useStaffAuth } from '../composables/useStaffAuth'
import { useAuth } from '../composables/useAuth'
import { useShows } from '../composables/useShows'
import ShowPoster from '../components/ShowPoster.vue'
import CopyButton from '../components/CopyButton.vue'
import { buildFacebookEventFields, FACEBOOK_CREATE_EVENT_URL } from '../utils/facebookEvent'

const route = useRoute()
const { isAuthenticated: isStaff, login: staffLogin } = useStaffAuth()
const { isAuthenticated: isContributor, login: contributorLogin } = useAuth()
const { getShowById, updatePromotion } = useShows()

const password = ref('')
const loginError = ref('')

const isContributorContext = computed(() => route.path.startsWith('/contributor/event'))
const canAccess = computed(() => isStaff.value || isContributor.value)
const backLink = computed(() => (isContributorContext.value ? '/contributor' : '/staff'))
const backLabel = computed(() => (isContributorContext.value ? 'Contributor View' : 'Staff View'))
const contextLabel = computed(() =>
  isContributorContext.value ? 'Contributor · Facebook Event Kit' : 'Staff · Facebook Event Kit'
)

const show = computed(() => getShowById(route.params.id))
const fields = computed(() => (show.value ? buildFacebookEventFields(show.value) : null))

function tryLogin() {
  loginError.value = ''
  if (staffLogin(password.value) || contributorLogin(password.value)) {
    return
  }
  loginError.value = 'Incorrect password.'
}

function markFacebookDone(checked) {
  if (show.value) {
    updatePromotion(show.value.id, 'facebookEvent', checked)
  }
}

function downloadPoster() {
  if (!show.value?.flier?.url) return
  const link = document.createElement('a')
  link.href = show.value.flier.url
  link.download = show.value.flier.filename || `${show.value.headliner}-poster`
  link.click()
}
</script>

<template>
  <div>
    <div v-if="!canAccess" class="max-w-lg mx-auto">
      <div class="text-center mb-8">
        <h2 class="section-title">Facebook Event Kit</h2>
        <p class="text-stone-600 mt-3 font-medium">
          Contributor or staff login required.
        </p>
      </div>
      <form class="panel p-6 space-y-4" @submit.prevent="tryLogin">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-1 text-sm font-heading font-bold uppercase tracking-wide text-berkeley-red hover:text-berkeley-red-dark"
        >
          ← Back to home
        </RouterLink>
        <input v-model="password" type="password" required class="input-field" placeholder="Contributor or staff password" />
        <p v-if="loginError" class="text-sm text-berkeley-red font-medium">{{ loginError }}</p>
        <button type="submit" class="btn-primary w-full">Enter</button>
      </form>
    </div>

    <div v-else-if="show && fields" class="max-w-3xl mx-auto">
      <RouterLink
        :to="backLink"
        class="inline-flex items-center gap-1 text-sm font-heading font-bold uppercase tracking-wide text-berkeley-red hover:text-berkeley-red-dark mb-6"
      >
        ← Back to {{ backLabel }}
      </RouterLink>

      <div class="mb-6">
        <p class="font-heading text-xs uppercase tracking-widest text-berkeley-red font-bold mb-1">{{ contextLabel }}</p>
        <h2 class="font-display text-3xl sm:text-4xl uppercase tracking-wide text-stone-900">
          {{ fields.title }}
        </h2>
        <ol class="mt-4 space-y-2 text-sm text-stone-600 font-medium list-decimal list-inside max-w-2xl">
          <li>Copy each field below (or use <strong>Copy all fields</strong>).</li>
          <li>Click <strong>Open Facebook Event Creator</strong> and paste into the new event.</li>
          <li>Upload the poster as the event cover photo.</li>
          <li>Check <strong>Mark Facebook event created</strong> when done.</li>
        </ol>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="panel p-5">
          <h3 class="font-heading text-xs uppercase tracking-wide text-stone-500 font-bold mb-3">Event poster</h3>
          <div class="flex justify-center bg-stone-100 rounded-xl p-4 min-h-[200px]">
            <ShowPoster v-if="show.flier" :show="show" size="lg" />
            <p v-else class="text-sm text-stone-500 self-center font-medium">No poster uploaded yet.</p>
          </div>
          <button
            v-if="show.flier"
            type="button"
            class="btn-secondary w-full mt-4 !text-sm"
            @click="downloadPoster"
          >
            Download poster
          </button>
        </div>

        <div class="space-y-4">
          <div class="panel p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-heading text-xs uppercase tracking-wide text-stone-400 font-bold">Event name</p>
                <p class="mt-1 font-semibold text-stone-900">{{ fields.title }}</p>
              </div>
              <CopyButton :value="fields.title" label="Copy" />
            </div>
          </div>

          <div class="panel p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-heading text-xs uppercase tracking-wide text-stone-400 font-bold">Date &amp; time</p>
                <p class="mt-1 font-semibold text-stone-900">{{ fields.dateLine }}</p>
              </div>
              <CopyButton :value="fields.dateLine" label="Copy" />
            </div>
          </div>

          <div class="panel p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-heading text-xs uppercase tracking-wide text-stone-400 font-bold">Location</p>
                <p class="mt-1 font-semibold text-stone-900">{{ fields.location }}</p>
              </div>
              <CopyButton :value="fields.location" label="Copy" />
            </div>
          </div>
        </div>
      </div>

      <div class="panel p-5 mb-6">
        <div class="flex items-start justify-between gap-3 mb-3">
          <p class="font-heading text-xs uppercase tracking-wide text-stone-400 font-bold">Description</p>
          <CopyButton :value="fields.description" label="Copy description" />
        </div>
        <p class="text-sm text-stone-700 whitespace-pre-line leading-relaxed">{{ fields.description }}</p>
      </div>

      <div class="panel p-5 mb-8 border-2 border-berkeley-green/30 bg-berkeley-green/5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <p class="font-heading text-xs uppercase tracking-wide text-stone-500 font-bold">Copy everything at once</p>
          <CopyButton :value="fields.fullPaste" label="Copy all fields" />
        </div>
        <pre class="text-xs text-stone-600 whitespace-pre-wrap font-sans leading-relaxed">{{ fields.fullPaste }}</pre>
      </div>

      <div class="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
        <a
          :href="FACEBOOK_CREATE_EVENT_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary"
        >
          Open Facebook Event Creator
        </a>
        <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            :checked="show.promotion.facebookEvent"
            class="w-4 h-4 rounded border-stone-300 text-berkeley-red focus:ring-berkeley-red"
            @change="markFacebookDone($event.target.checked)"
          />
          Mark Facebook event created
        </label>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <p class="font-heading uppercase tracking-wide text-stone-500">Show not found.</p>
      <RouterLink :to="backLink" class="text-berkeley-red font-heading font-bold uppercase mt-2 inline-block hover:underline">
        Back to {{ backLabel }}
      </RouterLink>
    </div>
  </div>
</template>
