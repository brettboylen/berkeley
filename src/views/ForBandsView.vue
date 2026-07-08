<script setup>
import { ref } from 'vue'
import HoursSection from '../components/HoursSection.vue'
import RecurringEventsSection from '../components/RecurringEventsSection.vue'

const contactEmail = 'berkeleyraleigh@gmail.com'
const copied = ref(false)

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(contactEmail)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="text-center mb-10">
      <h2 class="section-title">Book a Show</h2>

      <div class="mt-5 flex flex-col items-center gap-3">
        <a
          :href="`mailto:${contactEmail}?subject=Booking%20Inquiry%20-%20Berkeley%20Cafe`"
          class="text-2xl sm:text-3xl font-semibold text-berkeley-red hover:text-berkeley-red-dark transition-colors break-all leading-tight"
        >
          {{ contactEmail }}
        </a>
        <button
          type="button"
          class="btn-secondary text-sm !px-5 !py-2"
          @click="copyEmail"
        >
          {{ copied ? 'Copied!' : 'Copy email' }}
        </button>
      </div>

      <p class="text-stone-600 mt-5 font-medium">
        Everything you need to know about shows at Berkeley.
      </p>
    </div>

    <div class="space-y-6">
      <section class="panel p-6 sm:p-8">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-1">Show Schedule</h3>
        <p class="text-sm text-stone-500 font-heading uppercase tracking-wide mb-4">Unless otherwise noted</p>
        <dl class="space-y-4 text-stone-700 mb-6">
          <div>
            <dt class="font-heading font-bold uppercase tracking-wide text-stone-900">Thursday</dt>
            <dd class="mt-1">8:00 – 10:00 PM</dd>
          </div>
          <div>
            <dt class="font-heading font-bold uppercase tracking-wide text-stone-900">Friday</dt>
            <dd class="mt-1">8:30 – 10:30 PM</dd>
          </div>
          <div>
            <dt class="font-heading font-bold uppercase tracking-wide text-stone-900">Psychedelic Sunday</dt>
            <dd class="mt-1">6:00 – 8:00 PM</dd>
            <dd class="mt-2">
              A cross-genre exploration of the psychedelic theme. Welcoming jazz, rock, jam, etc.
            </dd>
          </div>
        </dl>

        <p class="text-stone-700 leading-relaxed border-t-2 border-stone-100 pt-5">
          We expect <strong>two sets of music</strong> with a short break somewhere in between for each show date.
          Bills can run slightly longer or shorter, but the <strong>house payment does not change</strong>.
        </p>

        <h4 class="font-heading font-bold uppercase tracking-wide text-stone-900 mb-3 mt-6">House Events — Not Available for Live Music</h4>
        <p class="text-stone-600 text-sm">
          Monday through Wednesday are reserved for weekly house events. See full details below.
        </p>
      </section>

      <section class="panel p-6 sm:p-8">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-3">How Booking Works</h3>
        <ul class="space-y-3 text-stone-700">
          <li class="flex gap-3">
            <span class="text-berkeley-red font-bold shrink-0">1.</span>
            <span>Check our public show calendar to see what dates are already confirmed.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-berkeley-red font-bold shrink-0">2.</span>
            <span>Email us with your band info, preferred dates, and links to your music.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-berkeley-red font-bold shrink-0">3.</span>
            <span>We review inquiries informally and follow up if the date and fit look good.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-berkeley-red font-bold shrink-0">4.</span>
            <span>Once confirmed, your show appears on the calendar and posters can be submitted for promotion.</span>
          </li>
        </ul>
      </section>

      <section class="panel p-6 sm:p-8">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-3">Pay &amp; Perks</h3>
        <p class="text-stone-700 mb-4">
          Each show includes a <strong>$100 house payment</strong>, food, tips from the tip jar,
          and a couple of drinks if you'd like them. Please bring a printed Venmo code if you
          would like to accept digital tips.
        </p>
        <ul class="space-y-2 text-stone-700">
          <li class="flex gap-2">
            <span class="text-berkeley-green font-bold">→</span>
            <span>The $100 house payment goes to the headliner or the band that booked the date first.</span>
          </li>
          <li class="flex gap-2">
            <span class="text-berkeley-green font-bold">→</span>
            <span>Opening acts receive food, drinks, and tips.</span>
          </li>
        </ul>
      </section>

      <section class="panel p-6 sm:p-8">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-3">Sound &amp; Equipment</h3>
        <p class="text-stone-700 mb-4">
          We provide an easy-to-use <strong>Peavey PA</strong> with two house speakers, three microphones,
          a monitor, and all the cables needed to get up and running.
        </p>
        <div class="rounded-xl bg-berkeley-yellow/30 border-2 border-berkeley-yellow px-4 py-3 text-stone-800">
          <p class="font-heading font-bold uppercase tracking-wide text-sm text-stone-900 mb-1">Important</p>
          <p class="text-sm leading-relaxed">
            There is no dedicated sound person on staff. That said, there is very often someone
            in the room who can help you dial in levels and give feedback on how things are sounding.
            The room generally sounds great — our best advice is to keep it simple and only bring
            gear you are practiced and familiar with.
          </p>
        </div>
      </section>

      <section class="panel p-6 sm:p-8">
        <h3 class="font-display text-2xl uppercase tracking-wide text-stone-900 mb-3">What to Send Us</h3>
        <ul class="list-disc list-inside space-y-1 text-stone-700">
          <li>Band or artist name</li>
          <li>Genre and a short description of your set</li>
          <li>Preferred date(s)</li>
          <li>Links to music (Spotify, Bandcamp, YouTube, etc.)</li>
          <li>Opening act(s), if any (up to 2 — many bands play both sets without an opener)</li>
        </ul>
      </section>

      <section class="card-block p-6 sm:p-8 text-center">
        <h3 class="font-display text-3xl uppercase tracking-wide">Get in Touch</h3>
        <p class="mt-3 text-white/90 font-medium">
          Email us to be considered for a booking. We'll review your inquiry and get back to you.
        </p>
        <a
          :href="`mailto:${contactEmail}?subject=Booking%20Inquiry%20-%20Berkeley%20Cafe`"
          class="inline-block mt-5 btn-primary !bg-white !text-berkeley-green hover:!bg-berkeley-yellow"
        >
          Send booking email
        </a>
        <p class="mt-4 text-sm text-white/70">
          Already affiliated with Berkeley Cafe?
          <RouterLink to="/contributor" class="underline font-semibold text-white">Go to Contributor View</RouterLink>
        </p>
      </section>

      <section class="text-center">
        <RouterLink to="/" class="btn-secondary">
          View Confirmed Shows
        </RouterLink>
      </section>
    </div>

    <div class="mt-16 space-y-16">
      <RecurringEventsSection />
      <HoursSection />
    </div>
  </div>
</template>
