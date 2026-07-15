# GitHub Copilot Instructions - My Cheap Chef (Varím zo zliav)

You are an expert Next.js and TypeScript developer assisting with the "My Cheap Chef" project.

## Project Overview
"My Cheap Chef" (Varím zo zliav) is a Next.js 16 application that showcases discounted supermarket products (currently Lidl Slovakia) and generates AI-based recipes using these products.
- **Products** are fetched **live from the Lidl API** (`src/lib/services/lidlService.ts`) on every render, cached by Next.js for 1h. `data/products.json` is NOT used for rendering.
- **Database**: JSON files under `data/` (e.g., `recipe.json`) reserved for AI-generated recipes, updated weekly by cron/standalone scripts.

## Directory Structure & Architecture
```
my-cheap-chef/
├── scripts/              ← Standalone TypeScript ingestion/cron scripts (run via tsx)
├── data/                 ← JSON files acting as our database (AI recipes; committed to Git)
├── public/               ← Static assets
└── src/
    ├── app/              ← Next.js App Router (RSCs render Lidl products directly; api/ serves data/*.json)
    │   └── api/          ← API Route Handlers serving data/*.json (no heavy logic here)
    ├── lib/              ← Shared types, utilities, and constants (framework-agnostic)
    └── components/       ← Reusable UI React components
```

## Styling & Design System
- **No utility CSS frameworks (like TailwindCSS)**: Use **CSS Modules** only. Avoid inline `style={{ ... }}`.
- Each component should have its own folder with a `.tsx` file and a `.module.css`/`.module.scss` file.
- Avoid ad-hoc utility styles; follow standard clean CSS designs.

## Conventions & Patterns
1. **Component Directory**: Put each component in `src/components/ComponentName/ComponentName.tsx` + `ComponentName.module.css`. Declare components as **arrow functions** (`export const ComponentName = (...) => {...}`). Re-export via a barrel file at `src/components/index.ts`. Import using `@/components`.
2. **Types**: Define types in `src/lib/types/` with a barrel re-export in `src/lib/types.ts`. Import using `@/lib/types`. Prefer `type` aliases over `interface`.
3. **Props**: Wrap all React component props in `Readonly<>` (e.g., `export const ProductCard = ({ product }: Readonly<ProductCardProps>) => {...}`).
4. **Data Access**:
   - **Products** come live from the Lidl API via `fetchActiveProducts()` — pages call it directly (no products JSON on disk).
   - Route Handlers read generated files from `data/` using `path.join(process.cwd(), 'data', '...')`.
   - Scripts run from the `scripts/` directory use `path.join(__dirname, '..', 'data', '...')`.
5. **Core Architecture**:
   - Next.js 16, React 19, and React Compiler (`babel-plugin-react-compiler`).
   - No state management library. React Server Components (RSC) are primary.
   - Use `axios` for HTTP inside scripts; use native `fetch` in `src/` (it integrates with Next.js caching).

## Language Conventions (CRITICAL)
- **UI Text**: Must be in **Slovak** (Slovenčina).
- **Code Comments**: Must be in **English**. (Never write comments in Russian, Slovak, or other languages).
- **Logs / Output Messages**: Must be in **English**.
- **Variables & Types**: Named in **English**.

## Key Commands
- `npm run dev` - Next.js development server
- `npm run data:parse` - (legacy) Ingest products from Lidl API -> `data/products.json` (not used by rendering)
- `npm run catalog:ingest` - Parse catalog images via Vision AI
- `npm run recipe:generate` - Generate weekly recipes via AI -> `data/recipe.json`
