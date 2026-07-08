<script setup>
import { reactive, computed, watch } from 'vue'
import { GENRES, ACT_TYPES } from '../data/constants'
import OpenerFields from './OpenerFields.vue'
import { formatShowTitle, isSunday } from '../utils/showTitle'
import { openersToFields, parseOpenersFromFields, openersAreValid } from '../utils/openers'

const props = defineProps({
  show: { type: Object, required: true },
})

const emit = defineEmits(['save', 'cancel'])

const openerFields = openersToFields(props.show.openers)

const form = reactive({
  headliner: props.show.headliner,
  hasOpeners: openerFields.hasOpeners,
  opener1: openerFields.opener1,
  opener2: openerFields.opener2,
  time: props.show.time,
  description: props.show.description,
  genre: props.show.genre,
  actType: props.show.actType ?? '',
  psychedelicSunday: !!props.show.psychedelicSunday,
})

const isSundayDate = computed(() => isSunday(props.show.date))

const previewTitle = computed(() =>
  form.headliner.trim()
    ? formatShowTitle({
        headliner: form.headliner.trim(),
        psychedelicSunday: form.psychedelicSunday,
      })
    : ''
)

watch(isSundayDate, (sunday) => {
  if (!sunday) form.psychedelicSunday = false
})

const canSave = computed(() => openersAreValid(form.hasOpeners, form.opener1))

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function handleSubmit() {
  if (!openersAreValid(form.hasOpeners, form.opener1)) return

  emit('save', {
    headliner: form.headliner,
    time: form.time,
    description: form.description,
    genre: form.genre,
    actType: form.actType,
    psychedelicSunday: form.psychedelicSunday,
    openers: parseOpenersFromFields(form.hasOpeners, form.opener1, form.opener2),
  })
}
</script>

<template>
  <form class="panel p-5 sm:p-6 space-y-4 border-2 border-berkeley-green/30" @submit.prevent="handleSubmit">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
      <div>
        <h4 class="font-display text-xl uppercase tracking-wide text-stone-900">Edit Show</h4>
        <p class="text-sm text-stone-500 mt-1">{{ formatDate(show.date) }} · Date changes require staff</p>
      </div>
      <button
        type="button"
        class="text-sm font-heading uppercase font-bold text-stone-500 hover:text-berkeley-red shrink-0"
        @click="emit('cancel')"
      >
        Close
      </button>
    </div>

    <p class="text-sm text-stone-600 font-medium rounded-xl bg-berkeley-yellow/30 border border-berkeley-yellow px-4 py-3">
      Update lineup or details after confirmation. Openers are optional — many bands play both sets.
      Staff will see changes on the calendar and in promotion tools.
    </p>

    <div>
      <label :for="`headliner-${show.id}`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
        Headliner <span class="text-berkeley-red">*</span>
      </label>
      <input
        :id="`headliner-${show.id}`"
        v-model="form.headliner"
        type="text"
        required
        class="input-field"
      />
    </div>

    <OpenerFields
      :id-prefix="`edit-${show.id}`"
      v-model:has-openers="form.hasOpeners"
      v-model:opener1="form.opener1"
      v-model:opener2="form.opener2"
    />

    <div>
      <label :for="`time-${show.id}`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
        Start time <span class="text-berkeley-red">*</span>
      </label>
      <input :id="`time-${show.id}`" v-model="form.time" type="time" required class="input-field max-w-xs" />
    </div>

    <div
      v-if="isSundayDate"
      class="rounded-xl border-2 border-sky-300 bg-sky-50 px-4 py-4"
    >
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          v-model="form.psychedelicSunday"
          type="checkbox"
          class="mt-1 w-4 h-4 rounded border-stone-300 text-sky-500 focus:ring-sky-400"
        />
        <span>
          <span class="font-heading font-bold uppercase tracking-wide text-stone-900 block">
            Psychedelic Sunday event
          </span>
          <span class="text-sm text-stone-600 mt-1 block">
            Listing appears as “Psychedelic Sunday” ahead of the band name.
          </span>
        </span>
      </label>
      <p v-if="previewTitle" class="mt-3 text-sm font-medium text-sky-800 border-t border-sky-200 pt-3">
        Preview: <span class="font-heading font-bold uppercase">{{ previewTitle }}</span>
      </p>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label :for="`genre-${show.id}`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
          Genre <span class="text-berkeley-red">*</span>
        </label>
        <select :id="`genre-${show.id}`" v-model="form.genre" required class="input-field">
          <option v-for="g in GENRES" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>
      <div>
        <label :for="`actType-${show.id}`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
          Act type <span class="text-berkeley-red">*</span>
        </label>
        <select :id="`actType-${show.id}`" v-model="form.actType" required class="input-field">
          <option value="" disabled>Select act type</option>
          <option v-for="t in ACT_TYPES" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
    </div>

    <div>
      <label :for="`description-${show.id}`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
        Description <span class="text-berkeley-red">*</span>
      </label>
      <textarea
        :id="`description-${show.id}`"
        v-model="form.description"
        required
        rows="3"
        class="input-field resize-y"
        placeholder="Provide exciting information about this act for use in social media promotion."
      />
    </div>

    <div class="flex flex-wrap gap-3 pt-2">
      <button type="submit" class="btn-primary" :disabled="!canSave">Save Changes</button>
      <button type="button" class="btn-secondary" @click="emit('cancel')">Cancel</button>
    </div>
  </form>
</template>
