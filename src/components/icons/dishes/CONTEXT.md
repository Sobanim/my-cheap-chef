# src/components/icons/dishes/

## Purpose

The animated SVG illustration shown for every recipe. We don't generate dish photos — unpredictable, often ugly, and billed per image — so each dish gets a hand-drawn scene instead.

## What's here

- `DishScene.tsx` — entry point. Picks a scene from the `(category, cookingMethod)` pair and renders it into a shared `0 0 24 24` viewBox.
- `DishScene.module.scss` — the animation kit (`steamA/B/C`, `heatA/B/C`, `bob`, `leaf`) plus the `prefers-reduced-motion` block.
- `parts/` — cookware chassis shared between scenes: `OvenFrame`, `PotFrame`, `PanFrame`.
- `scenes/` — one file per pair, named `<Category><Method>Scene.tsx`.

## The two axes

A scene is chosen by the **pair**, not by the category. `category` says what the dish is, `cookingMethod` says which vessel it's cooked in. They used to be one field, so `meat` mapped to exactly one scene and oven-roasted meat was drawn in a frying pan.

Valid pairs and the fallback live in [`@/lib/cookingMethods`](../../../lib/cookingMethods.ts). `SCENES` here is deliberately `Partial`: which pairs may be **generated** and which are **drawn** are different questions, and a pair can lose its picture without the food becoming invalid. Anything missing falls back to the category default, so nothing renders blank.

## Rules for adding or changing a scene

1. **Update [docs/dish-scene-matrix.svg](../../../../docs/dish-scene-matrix.svg).** It's the only place the whole set is visible at once, it's embedded in the README, and side-by-side is where inconsistencies actually show up.
2. **Build on a chassis from `parts/`** rather than copying cookware into the scene. Four hand-copied ovens will drift.
3. **Draw the cooking vessel, not the serving one.** A bowl is not a pot. Soup and pasta were both drawn as serving crockery at first, which is the same error the two-axis split exists to remove.
4. **Stick to the palette and the existing animation classes** — both are tabulated in [docs/RECIPE_GENERATION.md](../../../../docs/RECIPE_GENERATION.md#8b-pravidlá-kreslenia-scén). A new `@keyframes` needs a reason and an entry in the reduced-motion block.
5. **Never use `steamRise` inside the oven.** It travels -9px, which carries the strokes out through the door and reads as a fire. That's why `heatRise` exists.

## Why the chassis are not the rejected composition

Composing every scene from a generic vessel plus a generic filling was considered and rejected: a pan is drawn from above and an oven from the front, so one normalised food shape cannot be correct in both. The chassis here are shared only between scenes that already share a viewing angle — that's deduplication, not the abstraction that failed.
