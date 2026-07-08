import { createRouter, createWebHashHistory } from 'vue-router'
import CalendarView from '../views/CalendarView.vue'
import ForBandsView from '../views/ForBandsView.vue'
import ContributorView from '../views/ContributorView.vue'
import StaffView from '../views/StaffView.vue'
import FacebookEventKitView from '../views/FacebookEventKitView.vue'
import ShowDetailView from '../views/ShowDetailView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'shows', component: CalendarView },
    { path: '/book', name: 'book', component: ForBandsView },
    { path: '/contributor', name: 'contributor', component: ContributorView },
    { path: '/staff', name: 'staff', component: StaffView },
    { path: '/staff/event/:id', name: 'facebook-event-kit', component: FacebookEventKitView },
    { path: '/contributor/event/:id', name: 'contributor-facebook-event-kit', component: FacebookEventKitView },
    { path: '/show/:id', name: 'show', component: ShowDetailView },
    { path: '/for-bands', redirect: '/book' },
    { path: '/request', redirect: '/contributor' },
    { path: '/promotion', redirect: '/staff' },
    { path: '/gatekeeper', redirect: '/staff' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
