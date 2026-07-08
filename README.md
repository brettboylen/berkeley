# Berkeley Music

Prototype for booking shows, managing promotion, and sharing responsibility across staff and trusted contributors.

Built with **Vue 3**, **Tailwind CSS**, and **Vite**. Uses hash-based routing so it deploys to AWS S3/CloudFront without a custom domain or server-side rewrite rules.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview   # test the production build locally
```

Output goes to `dist/` — static files ready for S3.

## Prototype features

| Page | Route | Purpose |
|---|---|---|
| **Calendar** | `#/` | Month/list view of confirmed, promoted, and held shows |
| **Request Booking** | `#/request` | Intake form with date conflict warning |
| **Promotion** | `#/promotion` | Pending request review, promotion checkboxes, staff status controls |
| **Show detail** | `#/show/:id` | Single show view with promotion summary |

Data is in-memory (mock). Refreshing the page resets to seed data. This keeps the prototype simple until Google Calendar / Sheets integration is wired up.

## AWS deployment (no custom domain)

Works with the default S3 website endpoint or a CloudFront distribution URL.

### Option A — S3 static website

```bash
npm run build
aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
```

Enable static website hosting on the bucket. Set **index document** to `index.html` and **error document** to `index.html` (hash routing handles paths client-side).

### Option B — S3 + CloudFront (recommended)

1. Upload `dist/` to a private S3 bucket.
2. Create a CloudFront distribution with the S3 origin.
3. Set **Default root object** to `index.html`.
4. Add a custom error response: HTTP 403 → `/index.html` with 200 (covers direct `#/` access patterns).
5. Access via the `*.cloudfront.net` URL until your domain is ready.

### When the domain is ready

Point DNS at CloudFront, add the domain as an alternate domain name (CNAME), and attach an ACM certificate. No app code changes needed.

## Future integration points

| Current (prototype) | Production target |
|---|---|
| In-memory mock data | Google Calendar (confirmed shows) |
| Booking form → local state | Google Form or API → Google Sheet |
| Promotion checkboxes | Google Sheet columns |
| Flier upload (not yet in UI) | Google Drive folders per show |

The composable at `src/composables/useShows.js` is the single place to swap mock data for API calls later.

## Project structure

```
src/
  components/     StatusBadge, ShowCard
  composables/    useShows — shared state and actions
  data/           Seed data and constants
  router/         Hash-based Vue Router
  views/          Calendar, Booking, Promotion, Show detail
```
