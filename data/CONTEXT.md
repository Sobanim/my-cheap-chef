# data/

## Purpose

The MVP's "database": JSON files produced once a week by the pipeline in `scripts/` and committed to git by the GitHub Actions job. The web app reads them from disk at request time.

## Structure

```
data/
├── recipe.json           ← committed — the week's AI-generated recipes; read by src/lib/recipeData.ts
├── catalog.json          ← committed — every food product parsed from the flyer; read by src/lib/catalogData.ts
├── price-history.jsonl   ← committed — append-only price observations, one line per product per run
├── flyers/               ← gitignored — raw flyer snapshots ({slug}.json), re-fetchable
├── pages/                ← gitignored — raw vision output per flyer, re-creatable (costs API calls)
├── products.json         ← LEGACY — output of a removed script, nothing reads it
└── catalog-images/       ← LEGACY — manual flyer uploads from an abandoned approach (gitignored)
```

`flyer-overrides.json` (hand-curated page include/exclude for `scripts/catalog/classify-pages.ts`) is optional and does not exist yet.

## recipe.json

`{ generatedAt, recipes: Recipe[] }` — the `Recipe` type in `src/lib/types/recipe.ts` is the source of truth. Worth knowing:

- `id` is `recipe-a1` … `recipe-c4`: basket letter + position. Ids repeat every week.
- `basket` (`A` / `B` / `C`) decides on which weekday the recipe unlocks.
- `ingredients[].source` is `sale` (links to a catalog product via `productId`), `pantry`, or `buy`.
- `approxCost`, `checkoutCost`, `totalSavings` are computed in code from flyer prices and cover the `sale` ingredients only.
- `validUntil` (epoch seconds) is the last day the recipe's discounts hold; the app hides the recipe after it. Recipes generated before the field existed don't have it and never expire.

## catalog.json

`{ flyerIdentifier, offerStartDate, offerEndDate, generatedAt, products: Product[] }` — see `src/lib/types/product.ts`.

- `validFrom` / `validUntil` are epoch seconds at **UTC midnight of the Slovak calendar day**. Compare them by day (`getBratislavaDateKey`), never by raw timestamp.
- `dateLabel` is the banner text as printed and can disagree with the numeric dates after a duplicate is merged — trust the numbers.
- `oldPrice` is non-null only when a struck-through price was actually printed (`priceTier: "discounted"`).
- `imageUrl` is always empty — flyer products have no photo.

## Notes

- The files are regenerated, not hand-edited. To change their shape, change the generator.
- `price-history.jsonl` grows every run and is not de-duplicated; nothing reads it yet.
- Later, when this stops scaling → a real database (PostgreSQL/SQLite).
