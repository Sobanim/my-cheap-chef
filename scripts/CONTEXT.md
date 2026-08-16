# scripts/

## Purpose

The offline data pipeline: turns the weekly Lidl flyer into recipes. Runs on a
schedule (Monday cron) or manually. See
[docs/CATALOG_INGESTION_PLAN.md](../docs/CATALOG_INGESTION_PLAN.md) for the
design behind it and [docs/RECIPE_GENERATION.md](../docs/RECIPE_GENERATION.md)
for the recipe-prompt decisions.

## Where to start reading

**[weekly.ts](weekly.ts) is the only file that states the whole flow.** It reads
top to bottom like the list below, and every line is a click-through to the file
that does that one step. No step reaches around it, and no step calls another
step directly — if you're tracing "how do we get the product list", start here.

```
weekly.ts                       ← the entry point
  catalog/fetch-flyer.ts         Step 0: resolve this week's flyer, snapshot it
  catalog/classify-pages.ts      Step 1: altText → which pages are food
  catalog/parse-pages.ts         Step 2: page image → raw products (vision)
  catalog/normalize-products.ts  Step 3: raw → Product[] (tier, pricingUnit, dedupe)
  catalog/price-history.ts       Step 4: append-only price observations
  recipes/generate.ts            Step 5: phase loop → Recipe[]
    recipes/prompt.ts             the recipe prompt
    recipes/editor-prompt.ts      the culinary-review second pass
    recipes/schema.ts             Gemini responseSchema + zod validation
    recipes/money.ts              dishCost / checkoutCost / savings
    recipes/checks.ts             the warnAbout* sanity checks
    recipes/related.ts            links recipes sharing a discounted product
```

If the catalog pipeline (Steps 0–4) fails for any reason — flyer 404, Gemini
outage, a layout change Step 2 can't parse — `weekly.ts` falls back to
`fetchActiveProducts()` (the live Lidl API, ~44 products) and generates from
that instead. A degraded week beats a stale site. The fallback logs a loud
warning; check the Actions log if a run's catalog looks thin.

## Running

```bash
npm run weekly            # everything — what CI runs
npm run catalog:fetch     # Step 0 only: snapshot the current flyer
npm run catalog:parse     # Steps 1-3: snapshot → data/catalog.json
                           #   add --from-dump to re-normalize without re-running vision
npm run recipe:generate   # Step 5 only: data/catalog.json (or live API) → data/recipe.json
```

Each step reads its input from disk and writes its output to disk (see
`data/` below), so any step can be re-run alone while iterating — without
re-hitting the flyer API or re-paying for ~50 vision calls.

## data/ artifacts

| File | Committed? | Why |
|---|---|---|
| `flyers/{slug}.json` | no | raw flyer snapshot, re-fetchable |
| `pages/{slug}.json` | no | raw vision dump, re-fetchable (costs API calls to redo) |
| `catalog.json` | **yes** | the normalized pool a bad week can be diagnosed against |
| `flyer-overrides.json` | **yes** | hand-curated page include/exclude, belongs in history |
| `price-history.jsonl` | **yes** | append-only; worthless unless it accumulates across runs |
| `recipe.json` | **yes** | what the web app reads |

## Gemini quota

Free tier is 15 requests/minute/model. [lib/rate-limit.ts](lib/rate-limit.ts)
paces every call globally to stay under it — this is separate from Step 2's
concurrency (which only controls how many calls are in flight, not how fast
they're allowed to fire). [lib/gemini.ts](lib/gemini.ts) also retries a 429
using the API's own `retryDelay`, so a burst of quota errors doesn't just fail
the run.

## Notes on the recipe schema

- The model returns **two independent axes**: `category` (what the dish is) and `cookingMethod` (`pan` / `oven` / `pot` / `raw`). They were one field until oven-roasted meat kept being drawn in a frying pan — `category` was doing double duty as both dish type and technique, so a single scene per category could not be right.
- `baked` and `salad` were removed from `RECIPE_CATEGORIES` in favour of `veggie`. `baked` named a technique, not a dish, and next to `cookingMethod` it yielded the impossible pair `baked + pan`. `salad` was simply `veggie + raw`, so it made `salad:pan` and `veggie:pan` duplicates. The prompt tells the model this explicitly, because "salad" is an obvious category name it would otherwise reach for.
- `VALID_DISH_KEYS` decides what may be **generated**; the `SCENES` map decides what is **drawn**. Keep them separate — removing a pair from `VALID_DISH_KEYS` stops the model proposing that food, which is not the same as leaving its picture unfinished.
- A polymorphic `category` (string or object) was considered and rejected — Gemini's `responseSchema` is an OpenAPI subset with no union types, so the field would have to be loosened and structured output lost.
- When a dish uses several vessels, the method is the one where it **finishes** (seared then roasted = `oven`). Both `recipes/prompt.ts` and `recipes/editor-prompt.ts` state this rule; keep them in sync.
- `grill` and `microwave` are deliberately absent — a grill isn't in every kitchen and we don't want microwave cooking. The prompt forbids recipes that require a grill.
- Valid pairs live in `src/lib/cookingMethods.ts`, shared with the UI. `normalizeCookingMethod` in `recipes/checks.ts` warns and falls back instead of throwing: this runs in cron, and one bad pair must not cost the whole batch.
- `dishCost` vs `checkoutCost` (`recipes/money.ts`): the first is what a recipe consumes, the second is what buying whole packs actually costs. They diverge for anything not sold by weight — a recipe using 0.5 of a pack still forces a whole-pack purchase unless another recipe finishes the rest (see `recipes/related.ts`).
