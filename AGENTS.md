# AGENTS.md

## Project Overview

"My Cheap Chef" (Varím zo zliav) — a Next.js 16 app that turns the weekly Lidl Slovakia flyer into recipes built on the products that are on sale. The MVP uses JSON files in `data/` as its database, regenerated weekly by a GitHub Actions job. Deployed on Vercel.

Open work and known problems are tracked in [docs/BACKLOG.md](docs/BACKLOG.md) — check it before starting, update it when you close or find something.

## Architecture & Data Flow

```
.github/workflows/generate-recipes.yml   (Monday cron, or manual)
  └─ npm run weekly → scripts/weekly.ts
       ├─ Lidl flyer API → vision parsing (Gemini) → data/catalog.json
       │                                           → data/price-history.jsonl (append-only)
       └─ data/catalog.json → recipe generation (Gemini) → data/recipe.json
  └─ commits data/* straight to master → Vercel redeploys

src/app/* (Server Components) read data/recipe.json and data/catalog.json from disk at request time
```

- **Recipes** — `src/lib/recipeData.ts` reads `data/recipe.json`. Which recipes are visible follows the Lidl discount calendar (`src/lib/recipeAvailability.ts`): Mon–Wed → basket A, Thu–Fri → A+B, Sat–Sun → A+B+C. Recipes from a basket that hasn't started are shown as locked teasers and their detail page returns 404. Recipes whose discounts have ended (`Recipe.validUntil`) are not shown at all — this is what stops last week's recipes from posing as current when the weekly job is late.
- **Flyer catalog** — `src/lib/catalogData.ts` reads `data/catalog.json` (~400 products). It feeds the `/catalog` page and the "active discounts" count on the home page.
- **Live Lidl API** — `src/lib/services/lidlService.ts` (~50 products, cached 1h, 8s timeout, one retry). Used only as the pipeline's fallback when flyer parsing fails, and by the legacy `/discounts` page. The home page does **not** call it.
- **`scripts/`** — the offline pipeline, run via `tsx`. `scripts/weekly.ts` is the one file that states the whole flow; see `scripts/CONTEXT.md`.
- **`src/lib/`** — shared types/utilities, framework-agnostic. Used by both `scripts/` and `src/`.
- **`data/`** — committed to git: `recipe.json`, `catalog.json`, `price-history.jsonl`. Gitignored: `flyers/`, `pages/`, `catalog-images/`.
- There are **no API routes**. Pages read the JSON directly.

### Routes

| Route | What it is |
|---|---|
| `/` | Greeting + today's unlocked recipes + locked teasers |
| `/recipes` | All recipes of the week (unlocked + locked) |
| `/recipe/[id]` | Recipe detail; 404 while locked or after its discounts end |
| `/catalog` | Every product parsed from the flyer; recipe ingredients link here as `/catalog#product-<id>` |
| `/discounts` | Legacy live-API product grid — not in the navigation, reachable by URL only |
| `/offline` | Fallback page served by the service worker (`public/sw.js`) |

## Key Commands

```bash
npm run dev              # Next.js dev server
npm run build            # production build
npm run lint             # ESLint (currently fails — see docs/BACKLOG.md)
npm run weekly           # full pipeline: flyer → catalog → recipes (what CI runs)
npm run catalog:fetch    # Step 0 only: snapshot the current flyer
npm run catalog:parse    # Steps 1-3: snapshot → data/catalog.json
npm run recipe:generate  # Step 5 only: data/catalog.json → data/recipe.json
```

The pipeline needs `GEMINI_API_KEY` (local: `.env`, CI: repository secret). Analytics need `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`.

## Conventions & Patterns

- **Components**: each in its own folder `ComponentName/ComponentName.tsx` + `ComponentName.module.scss`. Exported via barrel `src/components/index.ts`. Import as `@/components`. Component functions **must** be declared as arrow functions: `export const ComponentName = ({ props }: Readonly<Props>) => { ... }`. (Next.js page/layout files keep `export default function`.)
- **Types**: defined in `src/lib/types/` with barrel re-export from `src/lib/types.ts`. Import as `@/lib/types`. Use `type` aliases instead of `interface` declarations.
- **Props**: wrapped in `Readonly<>` (see `ProductCard`).
- **Styling**: SCSS Modules only (`.module.scss`), no utility CSS frameworks. Avoid inline `style={{ ... }}`. Theme tokens live in `src/app/globals.scss`.
- **Language**: UI text is in **Slovak**, code comments in **English**, type/variable names in **English**.
- **Time**: anything that depends on "what day/hour is it" must go through `src/lib/bratislavaTime.ts`. Never use `Date.getDay()` / `getHours()` directly — the server runs in UTC, the discount calendar is Slovak. Flyer validity dates are stored as epoch seconds at UTC midnight of the Slovak calendar day; compare them by day key (`getBratislavaDateKey`), not by timestamp.
- **Data paths**: scripts use `path.join(__dirname, '..', 'data', '...')`; the app uses `path.join(process.cwd(), 'data/...')`.
- **HTTP**: native `fetch` everywhere (in `src/` it integrates with Next.js caching). There is no axios.
- **Recipe money** is computed in code from flyer prices, never by the model (`scripts/recipes/money.ts`, `src/lib/recipeMoney.ts`). A product without a printed original price never contributes a saving.

## Adding a New Component

1. Create `src/components/MyComponent/MyComponent.tsx` + `MyComponent.module.scss`
2. Export from `src/components/index.ts`
3. Import types from `@/lib/types` if needed

## Tech Stack Notes

- Next.js 16 (stable release line — do not pin a canary), React 19, React Compiler (`babel-plugin-react-compiler`)
- No state management library — React Server Components are primary
- Google Gemini via `@google/genai` (vision parsing + recipe text), responses validated with `zod`
- PostHog analytics in cookieless mode (no consent banner needed)
- PWA: `src/app/manifest.ts` + a minimal offline-fallback service worker in `public/sw.js`
- Security headers and the Content Security Policy are set in `next.config.ts`. A new external origin (script, image host, API called from the browser) must be added to the CSP there or the browser will block it.
- The root layout reads the theme cookie via `cookies()`, which makes every route render dynamically; the `revalidate` exports on pages currently have no effect.
- No test framework configured yet

## Dead / legacy code

Kept on purpose for now — do not build on it, and do not delete it without asking:

- `src/app/discounts/` with `ProductCatalog`, `ProductGrid`, `ProductCard` — the pre-flyer product grid on the live Lidl API
- `scripts/ingest-catalog.ts` — an unfinished stub of the first catalog-ingestion idea, superseded by `scripts/catalog/*`; not wired to any npm script
- `data/products.json` — output of a removed ingestion script; nothing reads it
- `data/catalog-images/` — folder for manually uploaded flyer pages, from the same abandoned approach
- `src/components/DevThemePanel/` — colour-scheme playground, commented out in the layout
- `src/app/api/CONTEXT.md` — an empty file in an otherwise empty folder; there are no API routes
- `index.html` (repo root, untracked) — standalone colour playground
