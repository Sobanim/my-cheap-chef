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

## Notes on the recipe schema

- The model returns **two independent axes**: `category` (what the dish is) and `cookingMethod` (`pan` / `oven` / `pot` / `raw`). They were one field until oven-roasted meat kept being drawn in a frying pan — `category` was doing double duty as both dish type and technique, so a single scene per category could not be right.
- `baked` and `salad` were removed from `RECIPE_CATEGORIES` in favour of `veggie`. `baked` named a technique, not a dish, and next to `cookingMethod` it yielded the impossible pair `baked + pan`. `salad` was simply `veggie + raw`, so it made `salad:pan` and `veggie:pan` duplicates. The prompt tells the model this explicitly, because "salad" is an obvious category name it would otherwise reach for.
- `VALID_DISH_KEYS` decides what may be **generated**; the `SCENES` map decides what is **drawn**. Keep them separate — removing a pair from `VALID_DISH_KEYS` stops the model proposing that food, which is not the same as leaving its picture unfinished.
- A polymorphic `category` (string or object) was considered and rejected — Gemini's `responseSchema` is an OpenAPI subset with no union types, so the field would have to be loosened and structured output lost.
- When a dish uses several vessels, the method is the one where it **finishes** (seared then roasted = `oven`). Both `recipe-prompt.ts` and `editor-prompt.ts` state this rule; keep them in sync.
- `grill` and `microwave` are deliberately absent — a grill isn't in every kitchen and we don't want microwave cooking. The prompt forbids recipes that require a grill.
- Valid pairs live in `src/lib/cookingMethods.ts`, shared with the UI. `normalizeCookingMethod` in `generate-recipe.ts` warns and falls back instead of throwing: this runs in cron, and one bad pair must not cost the whole batch.

## Notes

- Catalog images are currently uploaded manually to `data/catalog-images/`
- In the future: automatic PDF download → conversion to images
- Vision AI provider not yet chosen (OpenAI GPT-4o, Apify, or another — need to compare pricing)
