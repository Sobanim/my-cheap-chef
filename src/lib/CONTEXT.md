# src/lib/

## Purpose

Shared utilities, types, and helpers used by both the client (`src/app/`) and the server side (`src/app/api/`, `scripts/`).

## What's here

- `types/` + `types.ts` — shared data types (Product, Recipe, Lidl API, etc.), re-exported via the `@/lib/types` barrel
- `services/lidlService.ts` — live Lidl API fetch + parsing into the `Product` shape
- `dateUtils.ts` — date helpers and discount filtering (active/upcoming) + the discount cycle helper
- `menuLogic.ts` — greeting builder and placeholder recipe generation (`buildMenu`)

## Principles

- Code here does not depend on React/Next.js — plain TypeScript
- Can be used both in `scripts/` and in `src/app/`
- Types are defined once here and imported everywhere
