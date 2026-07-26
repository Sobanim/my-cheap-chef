# src/lib/

## Purpose

Shared utilities, types, and helpers used by both the client (`src/app/`) and the server side (`src/app/api/`, `scripts/`).

## What's here

- `types/` + `types.ts` — shared data types (Product, Recipe, Lidl API, etc.), re-exported via the `@/lib/types` barrel
- `services/lidlService.ts` — live Lidl API fetch + parsing into the `Product` shape
- `dateUtils.ts` — date helpers and discount filtering (active/upcoming) + the discount cycle helper
- `menuLogic.ts` — greeting builder (Slovak time-of-day + discount-calendar copy)
- `recipeData.ts` — reads the generated recipes from `data/recipe.json` (server-only, `fs`)
- `recipeAvailability.ts` — which promo baskets are unlocked today; splits recipes into available vs. upcoming
- `recipeLabels.ts` — Slovak display labels for categories/difficulty/ingredient source + plural helpers
- `cookingMethods.ts` — the `category` × `cookingMethod` matrix: valid pairs, per-category default, and `resolveDishKey` for picking a dish scene
- `baskets.ts` — assigns a product to promo basket A/B/C by its validity window

## Why a dish has two axes

A recipe carries both `category` (what the dish *is*) and `cookingMethod` (which vessel it's cooked in), and the animated SVG scene is picked by the **pair**.

They used to be one field, which forced `category` to answer two unrelated questions at once. That's what made the icons wrong in both directions: oven-roasted chicken is `meat`, `meat` mapped to a single pan scene, so it was drawn in a frying pan — while pan-fried cheese fell under the old `baked` value and was drawn as a roasting dish.

Two consequences worth knowing before changing anything here:

- Two category values were retired into `veggie`. `baked` described a technique rather than a dish, so alongside `cookingMethod` it would have produced the self-contradictory pair `baked + pan`. `salad` was the pair `veggie + raw` spelled as its own category — a salad is raw vegetables — so keeping it meant `salad:pan` and `veggie:pan` were two names for one picture. The feed still says "Šalát" for `veggie + raw` via `PAIR_LABELS` in `recipeLabels.ts`.
- The method column means the vessel a dish is **cooked** in, never the one it's served in. Soup lives in a pot, not a bowl; pasta lives in a pan, because it finishes there with its sauce. Both were drawn as serving crockery at first — the same mistake the two-axis split exists to remove, relocated from the method to the picture.
- `cookingMethod` is **optional** on `Recipe`. `data/recipe.json` still holds recipes generated before the field existed, and `loadRecipeData` parses that file with a blind cast, so unknown values do reach the UI. `resolveDishKey` absorbs both a missing method and an unrecognised category. The generator's zod schema, by contrast, requires the field.

## Principles

- Code here does not depend on React/Next.js — plain TypeScript
- Can be used both in `scripts/` and in `src/app/`
- Types are defined once here and imported everywhere
