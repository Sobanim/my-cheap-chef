# AGENTS.md

## Project Overview

"My Cheap Chef" (Varím zo zliav) — a Next.js 16 app that shows discounted supermarket products (Lidl Slovakia) and generates recipes from them. MVP uses JSON files as a database, updated weekly by cron scripts.

## Architecture & Data Flow

```
Live Lidl API → src/lib/services/lidlService.ts (fetch, cached 1h)
              → src/app/page.tsx & src/app/discounts (Server Components render directly)

scripts/generate-recipe.ts (weekly cron) → data/recipe.json → src/app/api/recipe/route.ts (serves JSON)
```

- **Products** are fetched **live from the Lidl API** on every render via `fetchActiveProducts()` (Next.js caches the response for 1h with `revalidate: 3600`). `data/products.json` is **no longer used** for rendering.
- **`scripts/`** — standalone TypeScript scripts run via `tsx`. The main future job is weekly recipe generation writing to `data/recipe.json`.
- **`src/app/`** — Next.js App Router. Pages are Server Components that call the Lidl service directly.
- **`src/app/api/`** — Route Handlers serve pre-computed JSON from `data/` (e.g. `recipe/route.ts`). No heavy logic here. There is no `products` route — pages read products directly.
- **`src/lib/`** — shared types/utilities, framework-agnostic. Used by both `scripts/` and `src/`.
- **`data/`** — JSON committed to git. Reserved for **AI-generated recipes** (`recipe.json`), not products. `catalog-images/` is gitignored.

## Key Commands

```bash
npm run dev              # Next.js dev server
npm run data:parse       # Fetch products from Lidl API → data/products.json
npm run catalog:ingest   # (WIP) Parse catalog images via Vision AI
npm run recipe:generate  # (WIP) Generate recipes via LLM
```

## Conventions & Patterns

- **Components**: each in its own folder `ComponentName/ComponentName.tsx` + `.module.css`. Exported via barrel `src/components/index.ts`. Import as `@/components`. Component functions **must** be declared as arrow functions: `export const ComponentName = ({ props }: Readonly<Props>) => { ... }`.
- **Types**: defined in `src/lib/types/` with barrel re-export from `src/lib/types.ts`. Import as `@/lib/types`. Use `type` aliases instead of `interface` declarations for props and other TypeScript definitions.
- **Props**: wrapped in `Readonly<>` (see `ProductCard`).
- **Styling**: CSS Modules only, no utility CSS frameworks. Avoid inline `style={{ ... }}`.
- **Language**: UI text is in **Slovak**, code comments in **English**, type/variable names in **English**.
- **Scripts**: use `path.join(__dirname, '..', 'data', '...')` for output paths.

## Adding a New Component

1. Create `src/components/MyComponent/MyComponent.tsx` + `MyComponent.module.css`
2. Export from `src/components/index.ts`
3. Import type from `@/lib/types` if needed

## Tech Stack Notes

- Next.js 16 with React 19 and React Compiler (`babel-plugin-react-compiler`)
- No state management library — RSC (React Server Components) are primary
- `axios` for HTTP in scripts; native `fetch` in `src/` (it integrates with Next.js caching — do not use axios there); `next/server` for API routes
- No test framework configured yet

## Known Tech Debt / TODO

- **`src/app/layout.tsx`** — inline `style={{ ... }}` on the layout wrapper; should move to a CSS Module.
- **`src/lib/services/lidlService.ts`** — the live Lidl `fetch` lacks a timeout (`AbortController`), a `User-Agent` header, and retries. Harden it.
- **`src/app/page.tsx`** — `"use no memo"` opts the page out of React Compiler; revisit and remove if no longer needed.
- **`scripts/types.ts`** vs **`src/lib/types/lidl.ts`** — duplicated Lidl API types; candidate for consolidation.
- **`buildMenu`** (`src/lib/menuLogic.ts`) — placeholder keyword-based "recipes"; to be replaced by real AI generation.
- **`scripts/ingest.ts`** — legacy product ingestion no longer used by rendering.

