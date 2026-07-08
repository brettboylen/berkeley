# Berkeley Calendar — Roadmap TODO

Last updated: 2026-07-07

## Completed — Phase 1 (prototype)

- [x] Client-side `.ics` export for confirmed + promoted shows (`src/utils/calendarExport.js`)
- [x] **Download .ics for Google Calendar** button in Staff View
- [x] Per-show **Facebook Event Kit** (`#/staff/event/:id`) with poster preview, copy fields, download poster, link to Facebook event creator
- [x] Mark **Facebook event created** checkbox from Event Kit

---

## Phase 2 — Production sync (backend required)

- [ ] Host a live **`/calendar.ics` subscription URL** so Google Calendar auto-updates when shows change (no manual re-import)
- [ ] Move poster storage to **S3** (or similar) with stable public URLs — required for reliable downloads and future integrations
- [ ] Replace in-memory mock data in `useShows.js` with persistent storage (database or Google Sheets API)
- [ ] Optional: **Google Calendar API** push to a shared staff calendar (one-way sync from Berkeley as source of truth)
- [ ] Decide whether **recurring house events** (Bingo, Karaoke, Open Mic, Psychedelic Sundays series) export to Google Calendar or stay website-only
- [ ] Document staff workflow: initial import vs. subscribe-to-feed vs. API push

---

## Phase 3 — Deeper automation (if volume justifies)

- [ ] **Meta Graph API** for Facebook Event creation (requires Facebook App, Page admin token, ongoing token refresh)
- [ ] Instagram scheduling integration (Buffer, Meta Business Suite, or API)
- [ ] Email notifications to contributors when shows are confirmed / promoted
- [ ] Two-way sync considerations (if staff edit Google Calendar directly — how to reconcile conflicts?)

---

## Questions to ask Alex

Use this list in a planning conversation before Phase 2/3:

1. **Source of truth** — Is everyone aligned that the Berkeley site calendar replaces Google Calendar as master, with Google as a read-only mirror for staff?
2. **Google Calendar workflow** — Does staff prefer one-time `.ics` import, a subscription feed that auto-updates, or automatic push via API?
3. **Shared calendar** — Is there an existing Google Calendar ID for Berkeley shows, or should we create a dedicated “Berkeley Live Music” calendar?
4. **Show duration** — Default export is 3 hours from start time; is that accurate for most shows (including Psychedelic Sunday)?
5. **Recurring events** — Should Mon–Wed house events and the Psychedelic Sunday series appear in Google Calendar exports, or only booked live music?
6. **Facebook Events** — Who creates events today (Alex, venue staff, contributors)? Is the copy-paste Event Kit enough, or is full API automation worth the Meta setup overhead?
7. **Facebook Page** — Which Facebook Page owns events? Do we have admin access for API work later?
8. **Posters** — Where should poster files live long-term (S3 bucket, Google Drive, both)? Any naming convention staff already uses?
9. **Promotion checklist** — Are the current promotion fields complete (`flier received`, `Facebook event`, `early social`, `day-of post`, `printed`, `displayed`)?
10. **Contributors** — Should contributors see export/promotion tools, or staff-only?
11. **Timeline** — When does the team want to stop maintaining the Google Calendar manually?

---

## Quick reference — Phase 1 usage

### Google Calendar import
1. Staff View → **Download .ics for Google Calendar**
2. Google Calendar → Settings → Import & export → Import → select `berkeley-shows.ics`

### Facebook Event
1. Staff View → Promotion Tracker → **Event kit →** on a show
2. Copy title, date/time, location, description (or **Copy all fields**)
3. **Download poster** → upload as Facebook event cover
4. **Open Facebook Event Creator** → paste fields → publish
5. Check **Mark Facebook event created**
