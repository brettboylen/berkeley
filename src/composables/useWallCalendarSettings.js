import { ref, watch } from 'vue'
import { VENUE } from '../data/venue'
import { DEFAULT_STANDARD_SHOW_TIME } from '../utils/showTime'

const STORAGE_KEY = 'berkeley-wall-calendar-standard-time'

const standardShowTime = ref(
  localStorage.getItem(STORAGE_KEY) || VENUE.standardShowTime || DEFAULT_STANDARD_SHOW_TIME
)

watch(standardShowTime, (value) => {
  if (value) localStorage.setItem(STORAGE_KEY, value)
  else localStorage.removeItem(STORAGE_KEY)
})

export function useWallCalendarSettings() {
  function setStandardShowTime(time) {
    standardShowTime.value = time
  }

  return {
    standardShowTime,
    setStandardShowTime,
  }
}
