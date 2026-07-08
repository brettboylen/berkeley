<script setup>
import { computed, watch } from 'vue'
import { MAX_OPENERS, openersAreValid } from '../utils/openers'

defineProps({
  idPrefix: { type: String, default: 'openers' },
})

const hasOpeners = defineModel('hasOpeners', { type: Boolean, default: false })
const opener1 = defineModel('opener1', { type: String, default: '' })
const opener2 = defineModel('opener2', { type: String, default: '' })

watch(hasOpeners, (checked) => {
  if (!checked) {
    opener1.value = ''
    opener2.value = ''
  }
})

const opener1Missing = computed(
  () => hasOpeners.value && !openersAreValid(hasOpeners.value, opener1.value)
)
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
      <div>
        <label :for="`${idPrefix}-opener-1`" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
          Opener 1 <span class="text-berkeley-red">*</span>
        </label>
        <input
          :id="`${idPrefix}-opener-1`"
          v-model="opener1"
          type="text"
          required
          class="input-field"
          placeholder="Opening act name"
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
          :disabled="!opener1.trim()"
        />
      </div>
      <p v-if="opener1Missing" class="text-sm text-berkeley-red font-medium">
        Enter at least one opening act, or uncheck the box above.
      </p>
      <p v-else class="text-xs text-stone-500 font-medium">Up to {{ MAX_OPENERS }} opening acts.</p>
    </div>
  </div>
</template>
