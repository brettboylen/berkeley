<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import ShowPoster from './ShowPoster.vue'
import { useShows } from '../composables/useShows'
import { formatShowTitle } from '../utils/showTitle'

const props = defineProps({
  show: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'uploaded'])

const { uploadFlier } = useShows()

const selectedFile = ref(null)
const fileInputKey = ref(0)
const uploadError = ref('')
const uploading = ref(false)

const isOpen = computed(() => !!props.show)
const isReplace = computed(() => !!props.show?.flier)

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

watch(
  () => props.show?.id,
  () => {
    selectedFile.value = null
    fileInputKey.value += 1
    uploadError.value = ''
    uploading.value = false
  }
)

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onEscapeKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onEscapeKey)
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onEscapeKey)
  document.body.style.overflow = ''
})

function onEscapeKey(event) {
  if (event.key === 'Escape') close()
}

function onFileChange(event) {
  selectedFile.value = event.target.files?.[0] ?? null
  uploadError.value = ''
}

function close() {
  if (uploading.value) return
  emit('close')
}

function onBackdropClick(event) {
  if (event.target === event.currentTarget) close()
}

function handleSubmit() {
  uploadError.value = ''

  if (!props.show) return
  if (!selectedFile.value) {
    uploadError.value = 'Choose a poster file first.'
    return
  }

  const allowed = ['image/png', 'image/jpeg', 'application/pdf']
  if (!allowed.includes(selectedFile.value.type)) {
    uploadError.value = 'File must be PDF, JPG, or PNG.'
    return
  }

  uploading.value = true
  const result = uploadFlier(props.show.id, selectedFile.value)
  uploading.value = false

  if (!result) {
    uploadError.value = 'Could not upload poster for this show.'
    return
  }

  emit('uploaded', { showId: props.show.id, replaced: result.replaced })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-stone-900/50 backdrop-blur-sm"
      @click="onBackdropClick"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`poster-modal-title-${show.id}`"
        class="w-full max-w-lg panel p-5 sm:p-6 shadow-poster max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3
              :id="`poster-modal-title-${show.id}`"
              class="font-display text-2xl uppercase tracking-wide text-stone-900"
            >
              {{ isReplace ? 'Replace Poster' : 'Upload Poster' }}
            </h3>
            <p class="text-sm text-stone-600 mt-1">
              {{ formatShowTitle(show) }} · {{ formatDate(show.date) }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 w-11 h-11 sm:w-9 sm:h-9 rounded-full border-2 border-stone-300 text-stone-500 hover:text-stone-900 hover:border-stone-400 font-heading text-xl sm:text-lg leading-none"
            aria-label="Close"
            :disabled="uploading"
            @click="close"
          >
            ×
          </button>
        </div>

        <p
          v-if="show.posterStale"
          class="rounded-xl bg-amber-50 border-2 border-amber-200 px-4 py-3 text-sm text-amber-900 font-medium mb-4"
        >
          The lineup changed since this poster was uploaded. Upload a corrected version with the updated acts.
        </p>

        <div v-if="isReplace" class="mb-5">
          <p class="text-xs font-heading uppercase tracking-wide text-stone-500 font-bold mb-2">
            Current poster
          </p>
          <div class="flex justify-center bg-stone-100 rounded-xl p-4 border-2 border-stone-200">
            <ShowPoster :show="show" size="md" />
          </div>
        </div>

        <div v-if="uploadError" class="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-800 mb-4">
          {{ uploadError }}
        </div>

        <div class="space-y-4">
          <div>
            <label
              :for="`poster-file-${show.id}`"
              class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5"
            >
              {{ isReplace ? 'New poster file' : 'Poster file' }}
            </label>
            <input
              :id="`poster-file-${show.id}`"
              :key="fileInputKey"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,image/png,image/jpeg,application/pdf"
              class="input-field file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-berkeley-green file:text-white file:font-heading file:text-sm file:uppercase"
              :disabled="uploading"
              @change="onFileChange"
            />
            <p class="text-xs text-stone-500 mt-1.5">PDF, JPG, or PNG</p>
          </div>

          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button
              type="button"
              class="w-full sm:w-auto min-h-[48px] px-6 py-3 sm:py-2.5 rounded-full border-2 border-stone-300 text-stone-700 font-heading font-bold uppercase tracking-wide text-sm hover:bg-stone-50"
              :disabled="uploading"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary w-full sm:w-auto min-h-[48px] py-3 sm:py-2.5 text-sm"
              :disabled="uploading || !selectedFile"
              @click="handleSubmit"
            >
              {{ uploading ? 'Saving…' : isReplace ? 'Replace Poster' : 'Upload Poster' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
