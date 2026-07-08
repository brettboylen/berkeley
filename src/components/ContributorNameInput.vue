<script setup>
import { computed } from 'vue'
import { useContributors } from '../composables/useContributors'

const { contributors } = useContributors()

defineProps({
  id: { type: String, required: true },
  modelValue: { type: String, required: true },
  label: { type: String, default: 'Your name' },
  hint: {
    type: String,
    default: 'Type your name — new contributors can enter any name each time.',
  },
  placeholder: { type: String, default: 'e.g. Jordan' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label :for="id" class="block text-sm font-heading font-bold uppercase tracking-wide text-stone-700 mb-1.5">
      {{ label }} <span class="text-berkeley-red">*</span>
    </label>
    <input
      :id="id"
      :value="modelValue"
      type="text"
      required
      autocomplete="name"
      :list="`${id}-suggestions`"
      class="input-field"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <datalist :id="`${id}-suggestions`">
      <option v-for="name in contributors" :key="name" :value="name" />
    </datalist>
    <p class="text-xs text-stone-500 mt-1.5 font-medium">{{ hint }}</p>
  </div>
</template>
