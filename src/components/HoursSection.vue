<script setup>
const hours = [
  {
    days: 'Monday – Thursday',
    time: '11:30 AM – 11:00 PM',
    food: 'Food until 10 PM!',
    music: null,
    note: null,
  },
  {
    days: 'Friday',
    time: '11:30 AM – 12:00 AM*',
    food: 'Food until 11 PM!',
    music: 'Live music around 8:30 PM',
    note: '*later, if there is a crowd',
  },
  {
    days: 'Saturday',
    time: '12:00 PM – 12:00 AM*',
    food: 'Food until 11 PM!',
    music: 'Live Music around 8:00 PM',
    note: '*later, if there is a crowd',
  },
  {
    days: 'Sunday',
    time: '12:00 PM – 10:00 PM*',
    food: 'Food until 9 PM!',
    music: 'Live Music around 6:00 PM',
    note: '*later, if there is a crowd',
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
          Berkeley Hours
        </h2>
        <p class="font-heading font-semibold italic text-stone-800 mt-1 uppercase tracking-wide text-sm">
          — Full Bar From Open to Close —
        </p>
      </div>

      <div class="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
        <div
          v-for="block in hours"
          :key="block.days"
          class="card-block px-5 py-4 text-center"
        >
          <h3 class="font-heading font-bold text-lg uppercase tracking-wide">{{ block.days }}</h3>
          <p class="font-heading font-semibold text-xl mt-1">{{ block.time }}</p>
          <p v-if="block.note" class="text-xs text-white/80 mt-0.5">{{ block.note }}</p>
          <p v-if="block.food" class="text-berkeley-yellow font-heading font-bold mt-2">{{ block.food }}</p>
          <p v-if="block.music" class="text-berkeley-yellow font-heading font-bold">{{ block.music }}</p>
        </div>
      </div>

      <p class="text-center font-heading font-bold uppercase text-sm sm:text-base text-stone-900 mt-6 tracking-wide">
        Check social media for official shows &amp; times!
      </p>

      <div class="flex flex-wrap justify-center gap-3 mt-4">
        <a
          href="https://instagram.com/berkeley_cafe"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary text-sm !px-5 !py-2"
        >
          IG: @berkeley_cafe
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary text-sm !px-5 !py-2"
        >
          FB: Berkeley Cafe
        </a>
      </div>
    </div>
  </section>
</template>
