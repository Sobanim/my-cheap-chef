# data/

## Purpose

Storage for **generated recipes** (JSON files) — the "database" for the MVP. Updated once a week by cron scripts from `scripts/`.

> ⚠️ **Products are no longer stored here.** The list of discounted products is fetched **live from the Lidl API** (`src/lib/services/lidlService.ts`) on every render (with a 1-hour Next.js cache). `data/` is meant for things that are expensive to generate — primarily the weekly recipes (`recipe.json`) created via AI by cron.

## Structure

```
data/
├── recipe.json           ← pre-generated recipe of the week (1-2 dishes, AI)
├── catalog-images/       ← (future) catalog images for Vision AI processing
│   └── lidl/
│       └── 2026-05-05/   ← folder by the catalog's start date
│           ├── page-01.jpg
│           └── ...
└── archive/              ← (future) archive of past weeks
```

> `products.json` — a legacy artifact (may remain from the old `ingest.ts` script), not used in rendering.

## recipe.json Format

```json
{
  "generatedAt": "2026-05-04T02:00:00Z",
  "recipes": [
    {
      "title": "Dish name",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "ingredientsFromSale": ["sale product 1", "sale product 2"],
      "steps": ["step 1", "step 2"],
      "estimatedTime": "30 min",
      "totalSavings": "5.20€"
    }
  ]
}
```

## Notes

- JSON files are committed to git (they are small, updated once a week)
- `catalog-images/` is added to .gitignore (images are heavy)
- In the future, when scaling → migrate to a database (PostgreSQL/SQLite)
