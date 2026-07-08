<script setup>
const events = [
  {
    when: 'Sunday Evening',
    name: 'Psychedelic Sundays',
    description:
      'Highly-curated music experiences to extend your weekend & expand your consciousness!',
    startTime: '6 pm',
    titleClass: 'text-sky-500',
  },
  {
    when: 'Monday Night',
    name: 'Berkeley Bingo',
    description: 'This format of BINGO! is steeped in over 25 years of tradition.',
    startTime: '8 pm',
    titleClass: 'text-berkeley-green',
  },
  {
    when: 'Tuesday Night',
    name: 'Blacklight Karaoke!',
    description: 'Come sing your most guilty-pleasures underneath black lights!',
    startTime: '8 pm',
    titleClass: 'text-purple-600',
  },
  {
    when: 'Wednesday Night',
    name: 'Open Mic!',
    description:
      'Sign-up and perform at our long-standing open mic night! Our audiences are very supportive!',
    startTime: '8 pm',
    titleClass: 'text-berkeley-red',
  },
]
</script>

<template>
  <section class="rounded-2xl overflow-hidden border-2 border-stone-900/10 shadow-poster">
    <div class="p-6 sm:p-8 bg-gingham">
      <div class="text-center mb-6">
        <h2
          class="font-display text-4xl sm:text-5xl text-stone-900 uppercase tracking-wide"
          style="-webkit-text-stroke: 2px white; paint-order: stroke fill;"
        >
          Weekly Recurring Events
        </h2>
      </div>

      <div class="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        <div
          v-for="event in events"
          :key="event.name"
          class="rounded-2xl bg-[#f5f0e6] border border-stone-900/5 px-5 py-4 flex flex-col min-h-[9rem] shadow-sm"
        >
          <p class="font-heading font-bold text-sm uppercase tracking-wide text-stone-900">
            {{ event.when }}:
          </p>
          <h3
            class="font-heading font-bold text-lg sm:text-xl uppercase tracking-wide mt-1"
            :class="event.titleClass"
          >
            {{ event.name }}
          </h3>
          <p class="text-stone-700 text-sm mt-2 leading-relaxed flex-1">
            {{ event.description }}
          </p>
          <p class="font-heading font-bold text-sm text-stone-900 text-right mt-3">
            Start time: {{ event.startTime }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
