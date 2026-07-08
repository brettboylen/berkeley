<script setup>
import { watch } from 'vue'
import { MAX_OPENERS } from '../utils/openers'

defineProps({
  idPrefix: { type: String, default: 'openers' },
})

const hasOpeners = defineModel('hasOpeners', { type: Boolean, default: false })
const openersLater = defineModel('openersLater', { type: Boolean, default: false })
const opener1 = defineModel('opener1', { type: String, default: '' })
const opener2 = defineModel('opener2', { type: String, default: '' })

watch(hasOpeners, (checked) => {
  if (!checked) {
    openersLater.value = false
    opener1.value = ''
    opener2.value = ''
  }
})

watch(openersLater, (later) => {
  if (later) {
    opener1.value = ''
    opener2.value = ''
  }
})
</script>

<template>
  <div class="space-y-3">
    <label class="flex items-start gap-3 cursor-pointer">
      <input
        :id="`${idPrefix}-has-openers`"
        v-model="hasOpeners"
        type="checkbox"
        class="mt-1 w-4 h-4 rounded border-stone-300 text-berkeley-red focus:ring-berkeley-red"
      />
      <span>
        <span class="font-heading font-bold uppercase tracking-wide text-stone-900 block">
          Will this show have opening acts?
        </span>
        <span class="text-sm text-stone-600 mt-1 block">
          Leave unchecked if the band will play both sets without an opener.
        </span>
      </span>
    </label>

    <div v-if="hasOpeners" class="space-y-3 pl-7 border-l-2 border-berkeley-green/30">
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          :id="`${idPrefix}-openers-later`"
          v-model="openersLater"
          type="checkbox"
          class="mt-1 w-4 h-4 rounded border-stone-300 text-berkeley-red focus:ring-berkeley-red"
        />
        <span class="text-sm text-stone-700 font-medium">
          Will update with openers later.
        </span>
      </label>

      <template v-if="!openersLater">
        <div>
          <label :for="`${idPrefix}-opener-1`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
            Opener 1 <span class="text-stone-400 font-semibold normal-case">(optional)</span>
          </label>
          <input
            :id="`${idPrefix}-opener-1`"
            v-model="opener1"
            type="text"
            class="input-field"
            placeholder="Opening act name, if known"
          />
        </div>
        <div>
          <label :for="`${idPrefix}-opener-2`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
            Opener 2 <span class="text-stone-400 font-semibold normal-case">(optional)</span>
          </label>
          <input
            :id="`${idPrefix}-opener-2`"
            v-model="opener2"
            type="text"
            class="input-field"
            placeholder="Second opening act, if any"
          />
        </div>
        <p class="text-xs text-stone-500 font-medium">
          Names can be added after confirmation. Up to {{ MAX_OPENERS }} opening acts.
        </p>
      </template>

      <p v-else class="text-sm text-stone-600 font-medium">
        No opener names needed now — update this show once openers are confirmed.
      </p>
    </div>
  </div>
</template>
