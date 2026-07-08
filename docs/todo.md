# Berkeley Cafe — Backend TODO

Last updated: 2026-07-07

This document lists everything the **backend** must provide before the prototype can run in production. The frontend is Vue 3 + Vite, deployed as static files (S3/CloudFront). All show/request state today lives in browser memory (`useShows.js`) and resets on refresh.

See also: [ROADMAP-TODO.md](./ROADMAP-TODO.md) for product phases and questions for Alex.

---

## Current prototype gaps (what the backend must replace)

| Area | Prototype today | Production need |
|------|-----------------|-----------------|
| Shows & requests | In-memory refs, seed data in `constants.js` | Database + REST/GraphQL API |
| Posters / fliers | Modal upload/replace in contributor UI; in-memory blob URLs + `version`; `posterStale` on lineup edit; lost on refresh | S3 + persistent URLs; versioned replace via `PUT /shows/:id/flier`; `posterStale` enforced server-side |
| Staff auth | `VITE_STAFF_PASSWORD` / `password` in `sessionStorage` | Server-side auth (sessions or JWT) |
| Contributor auth | Shared password in `sessionStorage` | Same, or per-user accounts later |
| Contributor name list | `localStorage` (`berkeley-contributor-registry`) | Server-stored suggestion list |
| Calendar export | Client download of `.ics` blob | Hosted `GET /calendar.ics` subscription feed |
| Wall calendar PDF | Client-side html2canvas + jsPDF; standard time in `localStorage` | Optional server PDF generation; persist `standardShowTime` + show times in DB |
| Promotion updates | Direct mutation in composable | API with staff authorization |
| Contributor edits/cancels | Client-side only, name string match | API validates contributor identity + ownership |
| IDs | Incrementing counters in memory | DB-generated UUIDs or serial IDs |

---

## Prototype complete (frontend only — no backend yet)

Poster upload & replace UX is implemented in the Vue prototype. Backend work below must persist and enforce the same behavior.

- [x] **Upload / Replace Poster** tab — month-filtered list of confirmed shows
- [x] **`PosterUploadModal.vue`** — modal for upload and replace (current poster preview, file picker, cancel/submit)
- [x] **`uploadFlier`** in `useShows.js` — initial upload and replace; bumps `version`; revokes old blob URL
- [x] **`posterStale`** — set when headliner or openers change on a show that already has a poster; clears on replace; resets `printed` / `displayed` (prototype)
- [x] **Mobile UX** — full-width 48px min-height buttons on small screens (list + modal)
- [ ] **My Shows** — optional CTA after lineup edit linking to poster replace (badge exists on poster tab only today)
- [ ] **Staff poster replace** — staff UI not built yet (contributor-only in prototype)
- [ ] **API + S3** — all poster data still in-memory; see Phase 1.4, 2.1

**Wall calendar print (Staff View)**

- [x] **`StaffWallCalendar.vue`** — two landscape letter months, separate preview + PDF per month
- [x] **`WallCalendarSheet.vue`** — seasonal styling, Berkeley Cafe sidebar, color-coded public shows + open nights
- [x] **Show times** — per-date time on poster; standard time + per-show staff overrides (`useWallCalendarSettings`, `updateShowTime`)
- [x] **Download both** — one-click to save two PDFs; print per month
- [ ] **Backend** — standard time + overrides should persist server-side in production

---

## Phase 1 — Core API & persistence (required first)

### 1.1 Choose stack & hosting

- [ ] Pick runtime (e.g. Node/Express, Python/FastAPI, AWS Lambda + API Gateway)
- [ ] Pick database (Postgres recommended; SQLite ok for small deploy; Google Sheets possible but weaker for posters/auth)
- [ ] Deploy API alongside existing S3/CloudFront static frontend (separate subdomain e.g. `api.berkeleycafe.com` or path-based proxy)
- [ ] Environment config: DB URL, secrets, S3 bucket, CORS origins

### 1.2 Data model

- [ ] **shows** table/collection
  - Fields: `id`, `headliner`, `openers` (array, max 2), `date`, `time`, `description`, `genre`, `actType`, `contributor`, `status` (`open` | `held` | `confirmed` | `promoted` | `canceled`), `psychedelicSunday`, `internalNotes`, `createdAt`, `updatedAt`
  - Nested or related **promotion** record: `flierReceived`, `facebookEvent`, `earlySocial`, `dayOfPost`, `printed`, `displayed`
  - Related **flier** record (current): `url`, `filename`, `mimeType`, `uploadedAt`, `uploadedBy`, `s3Key`, `version` (increment on replace)
  - Related **flier_history** (or `show_fliers` with `isCurrent` flag): prior uploads retained for audit; old S3 objects kept or archived per retention policy
  - Optional `posterStale` boolean (or `lineupChangedAt` timestamp): set when headliner/openers change after a poster exists — prompts contributor/staff to upload a corrected poster
- [ ] **booking_requests** table
  - Same show fields as intake + `submittedAt`, `reviewStatus` (`pending` | `approved` | `rejected`), link to `showId` when approved
- [ ] **contributors** table (suggestion registry only — names are still free-typed on forms)
  - `name`, `lastActivityAt`, `createdAt`, optional `removedAt`
- [ ] **audit_log** (optional but recommended): who changed status, promotion, openers, cancel reason

### 1.3 REST API — public read

- [ ] `GET /shows` — filter by status (public: `confirmed`, `promoted` only)
- [ ] `GET /shows/:id` — single show (respect public vs staff field visibility)
- [ ] `GET /shows?date=YYYY-MM-DD` — calendar day queries
- [ ] `GET /calendar.ics` — live iCal feed for confirmed + promoted shows (see Phase 2)

### 1.4 REST API — contributor (authenticated)

- [ ] `POST /booking-requests` — create request; validate date not Mon–Wed house block; normalize openers (0–2); register contributor name
- [ ] `GET /booking-requests?status=pending` — contributor calendar view (or fold into shows calendar endpoint)
- [ ] `PATCH /shows/:id` — contributor edit (openers, headliner, time, description, genre, actType, psychedelicSunday); **must verify** `contributor` matches authenticated user or submitted name policy
- [ ] `POST /shows/:id/cancel` — contributor cancel with optional reason → append `internalNotes`, set `status=canceled`
- [ ] `POST /shows/:id/flier` — initial multipart upload → S3, return public URL, set `promotion.flierReceived`, clear `posterStale`
- [ ] `PUT /shows/:id/flier` — **replace** existing poster (same show); bump `version`, archive previous file to history, update `url`/`s3Key`; contributor must own show
- [ ] `GET /shows/:id/flier` — current poster metadata (+ optional history for staff)

### 1.5 REST API — staff (authenticated)

- [ ] `GET /shows` — all statuses including `held`, `canceled`
- [ ] `GET /booking-requests` — all pending (and history if needed)
- [ ] `POST /booking-requests/:id/approve` — create show from request
- [ ] `POST /booking-requests/:id/reject`
- [ ] `POST /shows/:id/confirm` — held → confirmed
- [ ] `POST /shows/:id/release-hold` — held → canceled
- [ ] `PATCH /shows/:id/status` — arbitrary status change
- [ ] `PATCH /shows/:id/promotion` — update promotion checklist fields; auto `confirmed` ↔ `promoted` rules server-side
- [ ] `GET /contributors` — list with `lastActivityAt`
- [ ] `DELETE /contributors/:name` — remove from suggestion list
- [ ] `POST /contributors/prune-inactive` — remove names inactive 30+ days (batch job or staff trigger)
- [ ] `PUT /shows/:id/flier` — staff can upload or replace poster on any confirmed/promoted show (e.g. when contributor sends corrected art)
- [ ] `DELETE /shows/:id/flier` — staff-only remove poster (rare); clears current flier, does not delete S3 history

### 1.6 Business rules (enforce on server)

- [ ] Mon–Wed blocked for live music (house events: Bingo, Karaoke, Open Mic) — mirror `recurringEvents.js`
- [ ] Openers: 0 if `hasOpeners` false; if true, names optional; `openersPending` when contributor will add names later (max 2)
- [ ] Psychedelic Sunday flag only allowed on Sundays
- [ ] Date changes: contributor cannot change date (staff only) — match current UI
- [ ] Promotion auto-status: all promotion fields true → `promoted`; partial revert → `confirmed`
- [ ] Public calendar excludes `held`, `pending`, `canceled`
- [ ] **Lineup change → poster stale:** when `headliner` or `openers` (names or order) change on a show that already has a flier, set `posterStale=true` (do not auto-delete the old poster — it may still be in use until replaced)
- [ ] Optional: when `posterStale`, reset `promotion.printed` and `promotion.displayed` to false (poster in window may be wrong); keep `flierReceived=true` until a new file is uploaded
- [ ] Replacing a poster clears `posterStale` and updates `flierReceived`; decide whether `facebookEvent` / social flags need manual re-check after replace

### 1.7 Frontend integration

- [ ] Replace `useShows.js` in-memory mutations with API client (fetch/axios)
- [ ] Wire `PosterUploadModal.vue` → `POST` / `PUT /shows/:id/flier` (multipart); show loading/error in modal
- [ ] Loading & error states on calendar, staff, contributor views
- [ ] Optimistic UI optional; prefer server as source of truth after write
- [x] **Upload / Replace Poster tab** — modal flow, `posterStale` warnings on list (prototype; see above)
- [ ] **My Shows / edit form:** after saving opener or headliner changes, surface “upload updated poster” CTA if `posterStale` (partial: poster tab shows stale badge)

---

## Phase 2 — Files, calendar feed & auth hardening

### 2.1 Poster upload & replace (S3)

Posters are uploaded once and **replaced** when the lineup changes (headliner, opener names, or opener order). Initial upload and replace share the same file constraints but use different API methods (`POST` vs `PUT`).

- [ ] S3 bucket (private) + CloudFront or presigned URLs for downloads
- [ ] **Initial upload:** `POST /shows/:id/flier` — first poster for a show
- [ ] **Replace:** `PUT /shows/:id/flier` — swap in corrected art; bump `version`, archive previous file
- [ ] Upload path convention e.g. `posters/{showId}/v{version}/{filename}` — versioned keys so replaces do not break cached URLs
- [ ] Accept PDF, JPG, PNG; max file size; virus scan optional
- [ ] Replace prototype `uploadFlier` blob URLs with persistent `flier.url`
- [ ] **Replace flow:** new object uploaded → DB points to new URL → old object retained in `flier_history` (lifecycle rule: archive after N days optional)
- [ ] Cache busting: public pages and Facebook Event Kit use versioned URL or `?v={version}` query so replaced posters appear immediately
- [ ] Facebook Event Kit & public show pages must load **current** poster from stable versioned URL
- [x] Contributor UI: **Upload / Replace Poster** tab + `PosterUploadModal` (prototype); wire to API when backend exists
- [ ] Staff UI: upload/replace poster on behalf of contributor (not in prototype yet)

### 2.2 Live calendar subscription

- [ ] `GET /calendar.ics` — regenerate from DB on each request (or cache with short TTL)
- [ ] Timezone: `America/New_York`; default duration 3 hours (confirm with Alex)
- [ ] Include openers in description; venue from `venue.js`
- [ ] Decide: include recurring house events or music-only (see ROADMAP questions)
- [ ] `ETag` / `Last-Modified` headers for Google Calendar poll efficiency

### 2.3 Authentication

- [ ] Replace shared passwords with server-validated sessions or JWT
- [ ] Staff role vs contributor role (contributor may remain shared password initially)
- [ ] Rate limiting on login and booking submission
- [ ] Move secrets out of `VITE_*` env vars (never ship staff password in frontend bundle)
- [ ] HTTPS only; secure cookies if session-based

### 2.4 Contributor registry persistence

- [ ] Move `berkeley-contributor-registry` from `localStorage` to API
- [ ] Auto-add name on `POST /booking-requests`
- [ ] `lastActivityAt` computed from requests + shows (mirror `contributorActivity.js`)
- [ ] Staff prune inactive (30+ days) via API

---

## Phase 3 — Integrations & notifications

### 3.1 Google Calendar API (optional)

- [ ] OAuth service account or staff OAuth for shared calendar
- [ ] One-way push: Berkeley DB → Google Calendar on show create/update/cancel
- [ ] Map show fields to Google event; attach poster as attachment or link
- [ ] Reconcile if staff edits Google directly (policy: Berkeley wins, or read-only Google)

### 3.2 Facebook / Meta Graph API (optional)

- [ ] Facebook App + Page access token with refresh
- [ ] `POST /shows/:id/facebook-event` — create event from kit fields (`facebookEvent.js`)
- [ ] Store Facebook event ID on show for future updates
- [ ] Poster as event cover image from S3 URL
- [ ] On poster replace (`PUT /shows/:id/flier`), optionally push updated cover image to existing Facebook event (if API integrated)

### 3.3 Email / notifications

- [ ] Notify staff on new booking request (email or Slack)
- [ ] Notify contributor when request approved/rejected
- [ ] Notify contributor when show canceled by staff
- [ ] Optional: reminder when poster not uploaded X days before show
- [ ] Notify contributor (and/or staff) when lineup edit marks `posterStale` — “Poster may be outdated; please upload a corrected version”
- [ ] Notify staff when a replaced poster is uploaded (especially if printed/displayed was previously checked)

### 3.4 Instagram / social (optional)

- [ ] Buffer or Meta Business Suite integration
- [ ] Or keep manual copy from Facebook Event Kit

---

## Phase 4 — Ops, migration & quality

### 4.1 Seed & migration

- [ ] Import existing Google Calendar / spreadsheet data into `shows`
- [ ] One-time script from `constants.js` seed for dev/staging
- [ ] Migration strategy for any shows already entered in prototype (likely none in prod)

### 4.2 Backups & monitoring

- [ ] Automated DB backups
- [ ] Error logging (Sentry or CloudWatch)
- [ ] Uptime check on API and `/calendar.ics`

### 4.3 Testing

- [ ] API tests for booking rules (house nights, openers, status transitions)
- [ ] Integration test: request → approve → upload poster → promote
- [ ] Integration test: edit openers/headliner → `posterStale` set → replace poster → stale cleared, promotion flags behave as expected
- [ ] iCal output validation (Google Calendar import test)

### 4.4 Security review

- [ ] Authorization on every mutating endpoint
- [ ] File upload validation (type, size, path traversal)
- [ ] No PII in public show responses beyond contributor first name
- [ ] CORS locked to production frontend origin

---

## Suggested API surface (summary)

```
Public
  GET    /shows
  GET    /shows/:id
  GET    /calendar.ics

Contributor (auth)
  POST   /booking-requests
  PATCH  /shows/:id              # own shows only; lineup change may set posterStale
  POST   /shows/:id/cancel
  POST   /shows/:id/flier        # initial upload
  PUT    /shows/:id/flier        # replace poster (lineup corrections)
  GET    /shows/:id/flier

Staff (auth)
  GET    /shows                  # all statuses
  GET    /booking-requests
  POST   /booking-requests/:id/approve
  POST   /booking-requests/:id/reject
  POST   /shows/:id/confirm
  POST   /shows/:id/release-hold
  PATCH  /shows/:id
  PATCH  /shows/:id/status
  PATCH  /shows/:id/promotion
  GET    /contributors
  DELETE /contributors/:name
  POST   /contributors/prune-inactive
  PUT    /shows/:id/flier        # upload or replace on behalf of show
  DELETE /shows/:id/flier        # remove current poster (rare)

Auth
  POST   /auth/contributor/login
  POST   /auth/staff/login
  POST   /auth/logout
```

---

## Frontend files to update when API exists

| File | Status | Change |
|------|--------|--------|
| `src/components/PosterUploadModal.vue` | Prototype done | Call `POST` / `PUT /shows/:id/flier` instead of `uploadFlier`; upload progress + API errors |
| `src/composables/useShows.js` | Partial | `uploadFlier` + `posterStale` logic in prototype; swap to API client for all mutations |
| `src/views/ContributorView.vue` | Prototype done | Wire modal success to API response; optional stale CTA from My Shows |
| `src/composables/useAuth.js` | — | Login → `POST /auth/contributor/login` |
| `src/composables/useStaffAuth.js` | — | Login → `POST /auth/staff/login` |
| `src/composables/useContributors.js` | — | Fetch/delete via API |
| `src/utils/calendarExport.js` | — | Staff may link to `/calendar.ics` instead of client blob |
| `src/views/StaffView.vue` | — | Export button → subscription URL; staff poster upload/replace modal |
| `src/components/ShowPoster.vue` | Optional | Stale overlay / “outdated lineup” hint on public views |
| `.env` | — | `VITE_API_BASE_URL` only; no passwords in frontend |

---

## Decisions needed before build (ask Alex)

1. **Source of truth** — Berkeley site DB vs Google Calendar master
2. **Calendar workflow** — `.ics` subscription vs Google Calendar API push
3. **Recurring house events** — in public calendar API and `.ics` or not
4. **Show duration** for calendar exports (currently 3 hours)
5. **Poster storage** — S3 bucket name, path convention, version retention (how long to keep old posters), who pays AWS bill
6. **Poster replace policy** — contributor-only vs staff can replace; auto-reset `printed`/`displayed` when lineup changes?
7. **Contributor auth** — shared password long-term vs individual logins
8. **Facebook automation** — Event Kit (manual) vs Meta API; re-upload cover when poster replaced?
9. **Email provider** — SendGrid, SES, or manual for now
10. **Timeline** — when to retire manual Google Calendar maintenance

---

## Priority order (recommended)

1. **Database + core show/request CRUD API** (Phase 1.2–1.5)
2. **Staff & contributor auth** (Phase 2.3)
3. **S3 poster uploads + replace/versioning** (Phase 2.1) — including `posterStale` when lineup changes
4. **Live `/calendar.ics`** (Phase 2.2)
5. **Contributor registry API** (Phase 2.4)
6. **Email notifications** (Phase 3.3)
7. **Google Calendar API** (Phase 3.1) — if staff wants push sync
8. **Meta Graph API** (Phase 3.2) — only if volume justifies setup

---

## Out of scope for backend (frontend/static only)

- Hash routing / SPA hosting on S3+CloudFront (already documented in README)
- Recurring house event definitions (can stay in frontend config until API owns calendar)
- Book a Show marketing copy (`ForBandsView.vue`)
- Hours reference image / static assets
- Poster modal layout and mobile touch targets (`PosterUploadModal.vue`, contributor poster tab)
