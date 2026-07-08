import { isDateBlockedForMusic, getRecurringEventForDate, formatEventTime } from './recurringEvents'
import { formatShowTime, musicCellTimeLabel, PDF_MUSIC_NIGHT_SCHEDULE } from './showTime'

export const SHEET_WIDTH_PX = 1056
export const SHEET_HEIGHT_PX = 816

const PUBLIC_MUSIC_STATUSES = ['confirmed', 'promoted']
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CALENDAR_TEXT = '#1C1917'
export const HOUSE_CELL_STYLE = {
  background: '#F5F5F4',
  borderColor: '#78716C',
  color: CALENDAR_TEXT,
}
export const PSYCHE_SUNDAY_LABEL = 'Psyche-Sunday'
export const PSYCHEDELIC_SUNDAY_STYLE = {
  background: '#E0F2FE',
  borderColor: '#0369A1',
  color: CALENDAR_TEXT,
}

function houseEventShortLabel(recurring) {
  if (!recurring) return ''
  if (recurring.name.includes('Bingo')) return 'Berkeley Bingo'
  if (recurring.name.includes('Karaoke')) return 'Blacklight Karaoke'
  if (recurring.name.includes('Open Mic')) return 'Open Mic'
  return recurring.name
}

export function abbreviateHeadliner(name, maxLen = 16) {
  if (!name) return ''
  let text = name
    .replace(/^Psychedelic Sunday\s*[—–-]\s*/i, '')
    .replace(/^The\s+/i, '')
    .trim()

  if (text.length <= maxLen) return text

  const words = text.split(/\s+/)
  if (words.length > 2) {
    const twoWord = words.slice(0, 2).join(' ')
    if (twoWord.length <= maxLen) return twoWord
  }

  if (words.length > 1) {
    const firstWord = words[0]
    if (firstWord.length <= maxLen) return firstWord
  }

  return `${text.slice(0, Math.max(1, maxLen - 1))}…`
}

function musicCellShortLabel(show) {
  return abbreviateHeadliner(show.headliner, 14)
}

function padDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayStr() {
  const t = new Date()
  return padDate(t.getFullYear(), t.getMonth(), t.getDate())
}

// One distinct palette per calendar month so consecutive printed months never
// share the same colors. Patterns follow the season for a cohesive feel.
const MONTH_THEMES = [
  { // January — winter icy blue
    name: 'january', season: 'winter', pattern: 'snow',
    pageBg: 'linear-gradient(135deg, #EAF1F7 0%, #D3E0EC 45%, #F0F5FA 100%)',
    sidebarBg: '#3E5C74', monthColor: '#26374A', accent: '#5B84A6', accentLight: '#E8EFF5',
  },
  { // February — winter plum / berry
    name: 'february', season: 'winter', pattern: 'snow',
    pageBg: 'linear-gradient(135deg, #F5EAF0 0%, #E7CEDD 45%, #FAF0F5 100%)',
    sidebarBg: '#6D3B5E', monthColor: '#47263D', accent: '#A5628C', accentLight: '#F3E8EE',
  },
  { // March — early spring green
    name: 'march', season: 'spring', pattern: 'gingham',
    pageBg: 'linear-gradient(135deg, #EDF6E6 0%, #D6EDC9 45%, #F4FAEE 100%)',
    sidebarBg: '#4E7B3A', monthColor: '#33511F', accent: '#71A24E', accentLight: '#EEF6E8',
  },
  { // April — spring teal / mint
    name: 'april', season: 'spring', pattern: 'gingham',
    pageBg: 'linear-gradient(135deg, #E5F4F0 0%, #C8E9E0 45%, #EFF9F6 100%)',
    sidebarBg: '#2F7D6B', monthColor: '#1E5245', accent: '#4FA98F', accentLight: '#E8F5F0',
  },
  { // May — late spring rose
    name: 'may', season: 'spring', pattern: 'gingham',
    pageBg: 'linear-gradient(135deg, #F8ECF1 0%, #EFD2DE 45%, #FBF0F4 100%)',
    sidebarBg: '#B24A6E', monthColor: '#7A2E48', accent: '#D06E8E', accentLight: '#F8EBF0',
  },
  { // June — early summer gold
    name: 'june', season: 'summer', pattern: 'sun',
    pageBg: 'linear-gradient(135deg, #FBF3D8 0%, #F2E4AE 45%, #FAF6E4 100%)',
    sidebarBg: '#C79320', monthColor: '#7E5C0E', accent: '#E4B23C', accentLight: '#FBF4E0',
  },
  { // July — summer red
    name: 'july', season: 'summer', pattern: 'sun',
    pageBg: 'linear-gradient(135deg, #FCEEE2 0%, #F7DAC6 42%, #FDF2EA 100%)',
    sidebarBg: '#B02824', monthColor: '#8B1E1A', accent: '#D2322D', accentLight: '#FCEFE8',
  },
  { // August — late summer orange
    name: 'august', season: 'summer', pattern: 'sun',
    pageBg: 'linear-gradient(135deg, #FDEEE0 0%, #F8D6B8 45%, #FEF3E8 100%)',
    sidebarBg: '#C4622A', monthColor: '#83400F', accent: '#E0863C', accentLight: '#FDF0E4',
  },
  { // September — early fall amber
    name: 'september', season: 'fall', pattern: 'leaves',
    pageBg: 'linear-gradient(135deg, #FBF1DE 0%, #EFDBB2 45%, #FAF4E6 100%)',
    sidebarBg: '#B0821F', monthColor: '#6E4E10', accent: '#D1A63C', accentLight: '#FAF0DC',
  },
  { // October — fall pumpkin
    name: 'october', season: 'fall', pattern: 'leaves',
    pageBg: 'linear-gradient(135deg, #FAEBDD 0%, #EFCFB0 45%, #F8EEE2 100%)',
    sidebarBg: '#B5551F', monthColor: '#6B3212', accent: '#D2793A', accentLight: '#F9EBDD',
  },
  { // November — late fall russet
    name: 'november', season: 'fall', pattern: 'leaves',
    pageBg: 'linear-gradient(135deg, #F5E7DD 0%, #E4C4AE 45%, #F5EBE0 100%)',
    sidebarBg: '#8A4028', monthColor: '#5A2A16', accent: '#B0653E', accentLight: '#F5EAE0',
  },
  { // December — winter festive green
    name: 'december', season: 'winter', pattern: 'snow',
    pageBg: 'linear-gradient(135deg, #E9F2EA 0%, #CDE3D2 45%, #F0F6F1 100%)',
    sidebarBg: '#2F6B44', monthColor: '#1E4A2E', accent: '#4F9463', accentLight: '#E8F2EA',
  },
]

export function getMonthTheme(monthIndex) {
  return MONTH_THEMES[((monthIndex % 12) + 12) % 12]
}

// Backwards-compatible alias.
export const getSeasonTheme = getMonthTheme

export function getNextTwoCalendarMonths() {
  const today = new Date()
  let year = today.getFullYear()
  let month = today.getMonth()
  const months = []

  for (let i = 0; i < 2; i++) {
    months.push({ year, month })
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }

  return months
}

function getPublicMusicShowForDate(shows, dateStr) {
  return shows.find(
    (s) => s.date === dateStr && PUBLIC_MUSIC_STATUSES.includes(s.status)
  ) ?? null
}

function buildDayCell(dateStr, dayNum, shows, standardTime) {
  const today = todayStr()
  const isPast = dateStr < today
  const house = isDateBlockedForMusic(dateStr)
  const show = getPublicMusicShowForDate(shows, dateStr)
  const recurring = getRecurringEventForDate(dateStr)

  let kind = 'empty'
  if (house) kind = 'house'
  else if (show) kind = 'music'
  else if (!isPast) kind = 'open'

  return {
    dateStr,
    dayNum,
    isPast,
    isToday: dateStr === today,
    kind,
    show,
    recurring,
    timeLabel:
      kind === 'music'
        ? musicCellTimeLabel(show, standardTime)
        : kind === 'house' && recurring
          ? formatEventTime(recurring.time)
          : '',
    seriesLabel:
      kind === 'music' && show?.psychedelicSunday ? PSYCHE_SUNDAY_LABEL : '',
    shortLabel:
      kind === 'music'
        ? musicCellShortLabel(show)
        : kind === 'house'
          ? houseEventShortLabel(recurring)
          : kind === 'open'
            ? 'Open to book'
            : '',
  }
}

export function buildWallCalendarMonth(year, month, shows, standardTime) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const days = []

  for (let i = 0; i < startPad; i++) {
    days.push(null)
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const dateStr = padDate(year, month, d)
    days.push(buildDayCell(dateStr, d, shows, standardTime))
  }

  const openDates = days
    .filter((day) => day?.kind === 'open')
    .map((day) => day.dateStr)

  const musicShows = days
    .filter((day) => day?.kind === 'music' && day.show)
    .map((day) => day.show)

  const monthLabel = first.toLocaleDateString('en-US', { month: 'long' })
  const yearLabel = String(year)

  return {
    year,
    month,
    monthLabel,
    yearLabel,
    days,
    openDates,
    musicShows,
    theme: getMonthTheme(month),
    weekdayLabels: WEEKDAY_NAMES,
    standardTimeLabel: formatShowTime(standardTime),
    musicNightSchedule: PDF_MUSIC_NIGHT_SCHEDULE,
    generatedAt: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

export function buildWallCalendarSheets(shows, standardTime) {
  return getNextTwoCalendarMonths().map(({ year, month }) =>
    buildWallCalendarMonth(year, month, shows, standardTime)
  )
}

const FALLBACK_THEME = MONTH_THEMES[6]

export function cellStyle(day, theme = FALLBACK_THEME) {
  if (!day) return {}
  if (day.isPast && day.kind !== 'music') {
    return {
      background: '#F5F5F4',
      color: '#57534E',
      borderColor: '#D6D3D1',
    }
  }
  if (day.kind === 'house') {
    return {
      background: HOUSE_CELL_STYLE.background,
      color: HOUSE_CELL_STYLE.color,
      borderColor: HOUSE_CELL_STYLE.borderColor,
    }
  }
  if (day.kind === 'music' && day.show) {
    if (day.show.psychedelicSunday) {
      return {
        background: PSYCHEDELIC_SUNDAY_STYLE.background,
        color: PSYCHEDELIC_SUNDAY_STYLE.color,
        borderColor: PSYCHEDELIC_SUNDAY_STYLE.borderColor,
      }
    }
    return {
      background: theme.accentLight,
      color: CALENDAR_TEXT,
      borderColor: theme.accent,
    }
  }
  if (day.kind === 'open') {
    return {
      background: '#FFFFFF',
      color: CALENDAR_TEXT,
      borderColor: theme.accent,
      borderStyle: 'dashed',
    }
  }
  return {
    background: '#FAFAF9',
    color: CALENDAR_TEXT,
    borderColor: '#D6D3D1',
  }
}

export async function downloadWallCalendarPdf(element, filename = 'berkeley-wall-calendar.pdf') {
  const sheetEl = element?.querySelector?.('.wall-calendar-sheet') ?? element
  if (!sheetEl) throw new Error('Calendar sheet not found')

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(sheetEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    width: SHEET_WIDTH_PX,
    height: SHEET_HEIGHT_PX,
    windowWidth: SHEET_WIDTH_PX,
    windowHeight: SHEET_HEIGHT_PX,
  })

  const imgData = canvas.toDataURL('image/png', 1.0)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'letter',
  })

  pdf.addImage(imgData, 'PNG', 0, 0, 11, 8.5)
  pdf.save(filename)
}
