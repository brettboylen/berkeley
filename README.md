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

## AWS deployment (OpenTofu + S3/CloudFront)

The app uses **hash routing** (`#/staff`, `#/contributor`, etc.), so it works as a static site on S3 + CloudFront with no server.

Infrastructure is managed with **[OpenTofu](https://opentofu.org/)** and remote state in **S3 + DynamoDB** (for locking).

### Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws sts get-caller-identity`)
- [OpenTofu](https://opentofu.org/docs/intro/install/) (`tofu` on your PATH)

### First-time setup (bootstrap state backend)

Run once per AWS account. Creates the state bucket and lock table, then writes `infra/site/backend.hcl`:

```bash
npm run bootstrap:aws
```

Optional overrides:

```bash
PROJECT_NAME=berkeley-music AWS_REGION=us-east-1 npm run bootstrap:aws
```

### Deploy the prototype

```bash
npm run deploy:aws
```

This will:

1. Run `npm run build`
2. `tofu apply` in `infra/site` (S3 bucket + CloudFront)
3. Upload `dist/` to the bucket
4. Invalidate the CloudFront cache

When finished, the script prints the public **HTTPS** URL (a `*.cloudfront.net` address).

Override the site resource prefix or region:

```bash
PROJECT_NAME=berkeley-music-prototype AWS_REGION=us-east-1 npm run deploy:aws
```

Use `terraform` instead of `tofu` if preferred:

```bash
TF=terraform npm run deploy:aws
```

### Infrastructure layout

```
infra/
  bootstrap/   # One-time: S3 state bucket + DynamoDB lock table (local state)
  site/        # Site stack: S3 assets bucket + CloudFront (remote state)
```

When a custom domain is ready, add it to the CloudFront distribution in `infra/site/main.tf` with an ACM certificate. No app code changes needed.

### Prototype passwords

Staff and contributor views use the shared prototype password: `password`

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
