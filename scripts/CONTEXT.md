# scripts/

## Purpose

Cron scripts for data processing. Run on a schedule (once a week) or manually.

## What's here

- `ingest.ts` — legacy script: fetched products via the Lidl API and wrote `data/products.json`. **No longer needed for rendering** — products are fetched live in `src/lib/services/lidlService.ts`. Kept for reference/debugging.
- `types.ts` — types for the Lidl API response (duplicate `src/lib/types/lidl.ts` — candidate for consolidation)
- `generate-recipe.ts` — (WIP) takes products → sends to Text AI → generates 1-2 recipes → saves to `data/recipe.json`
- `ingest-catalog.ts` — (WIP) sends catalog images to Vision AI → JSON with a list of products

## Execution Order (cron, weekly)

The main cron job is now **recipe generation**:

1. `generate-recipe.ts` — takes current products → generates recipes → `data/recipe.json`

## Running

```bash
npm run data:parse          # current Lidl API script
npm run catalog:ingest      # (future) parse catalog images
npm run recipe:generate     # (future) generate recipes
```

## Notes

- Catalog images are currently uploaded manually to `data/catalog-images/`
- In the future: automatic PDF download → conversion to images
- Vision AI provider not yet chosen (OpenAI GPT-4o, Apify, or another — need to compare pricing)
