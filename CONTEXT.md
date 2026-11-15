# My Cheap Chef — "Cook from Discounts"

## About

The app helps people save money by suggesting recipes made from products that are currently on discount in supermarkets (Lidl Slovakia today; Kaufland and others are planned).

## Layout

```
my-cheap-chef/
├── src/
│   ├── app/              ← Next.js App Router pages (Server Components)
│   ├── lib/              ← Shared types, utilities, data loaders
│   └── components/       ← React components (SCSS Modules)
├── scripts/              ← The weekly pipeline: flyer → catalog → recipes
├── data/                 ← JSON "database": recipe.json, catalog.json, price-history.jsonl
├── docs/                 ← Design docs + BACKLOG.md
├── public/               ← Static assets, service worker
└── .github/workflows/    ← Weekly generation job, Claude review bots
```

## Tech Stack

- **Frontend**: Next.js 16 (stable), React 19 + React Compiler, SCSS Modules
- **Backend**: none of its own — pages read pre-computed JSON from `data/`; there are no API routes
- **Pipeline**: TypeScript scripts (`tsx`), run weekly by GitHub Actions
- **AI**: Google Gemini (`@google/genai`) — vision for flyer pages, text for recipes
- **Data**: JSON files committed to git; a real database is a later step
- **Analytics**: PostHog, cookieless
- **Deployment**: Vercel (server runs in UTC — see `src/lib/bratislavaTime.ts`)

## Key Commands

```bash
npm run dev              # start the dev server
npm run build            # production build
npm run weekly           # full pipeline: flyer → catalog → recipes
npm run catalog:fetch    # snapshot the current flyer
npm run catalog:parse    # flyer snapshot → data/catalog.json
npm run recipe:generate  # data/catalog.json → data/recipe.json
```

## Data Flow

1. **Weekly job** (`.github/workflows/generate-recipes.yml`, Monday): `npm run weekly` resolves the current Lidl flyer, picks the food pages, reads the products off each page with Gemini vision, and normalizes them into `data/catalog.json`. Prices are appended to `data/price-history.jsonl`.
2. **Recipes**: the same run generates 12 recipes (4 per promo basket A/B/C) from the catalog into `data/recipe.json`. Products whose discount ends before the week does (one-day specials) are kept out of the recipe pool. If flyer parsing fails, the run falls back to the live Lidl API (~50 products).
3. **Publish**: the job commits the data files to `master`; Vercel redeploys.
4. **Site**: the home page and `/recipes` show the recipes whose basket is live today (Mon–Wed → A, Thu–Fri → A+B, Sat–Sun → A+B+C, in Slovak time). Later baskets appear as locked teasers. Recipes whose discounts have ended are hidden. `/catalog` lists every flyer product.

> GitHub's cron is best-effort: a run scheduled for 02:00 UTC has been observed starting ~7 hours late. Until it finishes on Monday, last week's recipes are expired and the site shows the "preparing new recipes" state rather than stale prices.

## Status

- [x] Flyer parsing via Vision AI → `data/catalog.json`
- [x] Recipe generation via Gemini → `data/recipe.json`
- [x] Weekly pipeline on GitHub Actions
- [x] Recipe feed, recipe detail, flyer catalog pages
- [x] PWA (manifest + offline fallback)
- [x] Deployment on Vercel
- [ ] Retention features (shopping list, favourites) — see `docs/BACKLOG.md`
- [ ] Multi-store support
