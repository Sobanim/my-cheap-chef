# AGENTS.md

## Project Overview

"My Cheap Chef" (Varím zo zliav) — a Next.js 16 app that shows discounted supermarket products (Lidl Slovakia) and generates recipes from them. MVP uses JSON files as a database, updated weekly by cron scripts.

## Architecture & Data Flow

```
scripts/ingest.ts → data/products.json → src/app/page.tsx (SSR reads file directly)
                                        → src/app/api/products/route.ts (serves JSON via API)
```

- **`scripts/`** — standalone TypeScript scripts run via `tsx`. They fetch data and write to `data/*.json`.
- **`src/app/`** — Next.js App Router. The main page is a Server Component that reads `data/products.json` directly from disk.
- **`src/app/api/`** — Route Handlers only serve pre-computed JSON from `data/`. No heavy logic here.
- **`src/lib/`** — shared types/utilities, framework-agnostic. Used by both `scripts/` and `src/`.
- **`data/`** — JSON files committed to git (small, updated weekly). `catalog-images/` is gitignored.

## Key Commands

```bash
npm run dev              # Next.js dev server
npm run data:parse       # Fetch products from Lidl API → data/products.json
npm run catalog:ingest   # (WIP) Parse catalog images via Vision AI
npm run recipe:generate  # (WIP) Generate recipes via LLM
```

## Conventions & Patterns

- **Components**: each in its own folder `ComponentName/ComponentName.tsx` + `.module.css`. Exported via barrel `src/components/index.ts`. Import as `@/components`.
- **Types**: defined in `src/lib/types/` with barrel re-export from `src/lib/types.ts`. Import as `@/lib/types`.
- **Props**: wrapped in `Readonly<>` (see `ProductCard`).
- **Styling**: CSS Modules only, no utility CSS frameworks.
- **Language**: UI text is in **Slovak**, code comments in **Russian**, type/variable names in **English**.
- **API routes**: read from `data/` directory using `path.join(process.cwd(), 'data', '...')`.
- **Scripts**: use `path.join(__dirname, '..', 'data', '...')` for output paths.

## Adding a New Component

1. Create `src/components/MyComponent/MyComponent.tsx` + `MyComponent.module.css`
2. Export from `src/components/index.ts`
3. Import type from `@/lib/types` if needed

## Adding a New API Route

1. Create `src/app/api/<name>/route.ts`
2. Read data from `data/*.json` — do NOT run heavy computations in route handlers
3. Return `NextResponse.json(...)`

## Tech Stack Notes

- Next.js 16 with React 19 and React Compiler (`babel-plugin-react-compiler`)
- No state management library — RSC (React Server Components) are primary
- `axios` for HTTP in scripts; `next/server` for API routes
- No test framework configured yet

