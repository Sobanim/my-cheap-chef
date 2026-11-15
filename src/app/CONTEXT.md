# src/app/

## Purpose

The client-facing part of the app — Next.js App Router pages. All pages are Server Components that read pre-computed JSON from `data/` through the loaders in `src/lib/`.

## What's here

- `layout.tsx` — root layout: fonts, site-wide metadata (title template, Open Graph defaults, `Organization` + `WebSite` structured data), theme (read from the `mcc-theme` cookie), header, footer, bottom tab bar, analytics, service-worker registration
- `page.tsx` — home: greeting card, today's unlocked recipes, locked teasers
- `recipes/` — all recipes of the week
- `recipe/[id]/` — recipe detail, with its own `<title>` via `generateMetadata`; 404 while the recipe is locked or after its discounts end
- `catalog/` — every product parsed from the weekly flyer (`data/catalog.json`)
- `o-aplikacii/` — promo / landing page for first-time visitors, search engines and AI assistants: what the app does, how it works, three live recipes, FAQ (with `FAQPage` structured data). The home page stays the app itself
- `sitemap.ts`, `robots.ts` — generate `/sitemap.xml` and `/robots.txt`; the sitemap lists only recipes that can be opened today
- `llms.txt/route.ts` — `/llms.txt`, a plain-text description of the site and this week's recipes for language models
- `opengraph-image.tsx`, `recipe/[id]/opengraph-image.tsx`, `_og/renderOgImage.tsx` — link-preview images (the picture shown when a link is shared)
- `discounts/` — **legacy**: product grid on the live Lidl API, not linked from the navigation
- `offline/` — fallback page the service worker serves when a navigation fails
- `manifest.ts` — PWA manifest (served as `/manifest.webmanifest`)
- `globals.scss`, `themes.scss` — design tokens, light/dark themes, dev colour schemes
- `page.module.scss` — the app shell layout
- `icon.svg`, `apple-icon.png` — app icons
- `api/` — empty apart from a blank `CONTEXT.md`; there are no API routes

## Notes

- Because the layout calls `cookies()`, every route renders dynamically. The `revalidate = 3600` exports on pages are kept for the day the theme no longer needs a server-side cookie read, but have no effect today.
- "Today" is always Slovak time — pages pass `new Date()` to helpers that read it through `src/lib/bratislavaTime.ts`.

## Technologies

- Next.js 16 (App Router, React Server Components)
- React 19
- SCSS Modules
