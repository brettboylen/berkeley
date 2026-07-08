<script setup>
import { ref } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: 'Copy',
  },
})

const copied = ref(false)
let timer

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // fallback for older browsers
    const ta = document.createElement('textarea')
    ta.value = props.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <button
    type="button"
    class="shrink-0 px-3 py-1.5 rounded-full border-2 border-stone-300 text-xs font-heading font-bold uppercase tracking-wide hover:bg-stone-50 transition-colors"
    @click="copy"
  >
    {{ copied ? 'Copied!' : label }}
  </button>
</template>
