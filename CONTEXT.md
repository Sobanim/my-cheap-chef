# My Cheap Chef — "Cook from Discounts"

## About

The app helps people save money by suggesting recipes made from products that are currently on discount in supermarkets (Lidl, Kaufland — Slovakia).

## Architecture (monorepo)

```
my-cheap-chef/
├── src/
│   ├── app/              ← Next.js App Router (client-facing pages)
│   │   └── api/          ← API routes (server logic, Route Handlers)
│   ├── lib/              ← Shared types, utilities, constants
│   └── components/       ← React components
├── scripts/              ← Cron scripts (catalog parsing, recipe generation)
├── data/                 ← JSON data files (recipes, catalog-images)
├── public/               ← Static assets
└── 🧠 Идея приложения.md ← Idea and business logic description
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, CSS Modules
- **Backend**: Next.js API Routes (Route Handlers)
- **Scripts**: TypeScript (tsx), run via cron
- **AI**: Vision AI (catalog parsing) + Text AI (recipe generation) — provider TBD
- **Data**: JSON files (MVP), PostgreSQL/SQLite in the future
- **Deployment**: Vercel (planned)

## Key Commands

```bash
npm run dev             # start the dev server
npm run build           # build
npm run data:parse      # parse products via the Lidl API
npm run catalog:ingest  # (future) parse catalog images via Vision AI
npm run recipe:generate # (future) generate recipes via AI
```

## Data Flow

1. **Products (current)**: pages (`src/app/page.tsx`, `src/app/discounts`) — Server Components — call `fetchActiveProducts()` from `src/lib/services/lidlService.ts`, which makes a **live request to the Lidl API** (the same request the Lidl website sends). The response is cached by Next.js for 1 hour (`revalidate: 3600`). The `data/products.json` file is **no longer used** for rendering.
2. **Recipes (future)**: the cron script `scripts/generate-recipe.ts` generates recipes via AI once a week and saves them to `data/recipe.json`. The route `src/app/api/recipe/route.ts` serves this file to the client.
3. **`data/` going forward** stores exactly the **generated recipes** (`recipe.json`), not products. Products are always fetched live from Lidl.
4. **Paid feature** (future): on-demand generation of additional recipes.

> ⚠️ The current "recipes" on the home page (`buildMenu` in `src/lib/menuLogic.ts`) are a temporary placeholder: real products are distributed across predefined dish templates by keyword matching. Real AI generation will come later.

## Status

- [x] Fetching products via the live Lidl API (home + discounts page)
- [ ] Recipe generation via Text AI (cron → `data/recipe.json`)
- [ ] Catalog parsing via Vision AI
- [ ] PWA
- [ ] Deployment
