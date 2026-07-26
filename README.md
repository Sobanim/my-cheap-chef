# 🍳 My Cheap Chef — Cook from Discounts
 
> **Status: 🚧 Work in Progress (MVP)**

An AI-powered app that suggests recipes based on products currently on sale in supermarkets (Lidl, Kaufland — Slovakia). Save money and never wonder "What should I cook?" again.

## 🎯 Problem

- People don't know what to cook.
- They want to save money by buying discounted products.
- Nobody analyzes promotional catalogs from the cooking perspective.

## 💡 Solution

The app connects **supermarket discount catalogs** with **AI-generated recipes** — so every dish you cook is made from products that are currently on sale.

## 🧱 Architecture

```
my-cheap-chef/
├── src/
│   ├── app/              ← Next.js App Router (pages & UI)
│   │   └── api/          ← API Routes (Route Handlers)
│   ├── lib/              ← Shared types, utilities, constants
│   └── components/       ← (planned) React components
├── scripts/              ← Cron scripts (catalog parsing, recipe generation)
├── data/                 ← JSON data files (products, recipes, catalog images)
└── public/               ← Static assets
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, CSS Modules |
| Backend | Next.js API Routes (Route Handlers) |
| Scripts | TypeScript (tsx), cron-based |
| AI | Vision AI (catalog parsing) + Text AI (recipe generation) — provider TBD |
| Data | JSON files (MVP), PostgreSQL/SQLite planned |
| Deployment | Vercel (planned) |

## 🎨 Dish Illustrations

We don't generate dish photos — they're unpredictable, often ugly, and cost money per recipe. Instead every dish gets a hand-drawn animated SVG scene, picked by **two independent axes**:

- `category` — what the dish *is* (`meat`, `pasta`, `soup`, `veggie`, `dessert`)
- `cookingMethod` — which vessel it's cooked in (`pan`, `oven`, `pot`, `raw`)

<img src="docs/dish-scene-matrix.svg" alt="Every dish scene, laid out by category and cooking method" width="680">

Empty cells are combinations that aren't real food (raw pasta, soup in a frying pan), and the generator is told not to produce them.

**Why two axes and not one.** `category` used to be the only field, which forced it to answer both questions at once. The result was visibly wrong icons: oven-roasted chicken is `meat`, `meat` mapped to a single frying-pan scene, so a roast was drawn in a pan. The reverse happened too — pan-fried cheese fell under the old `baked` value and was drawn as a roasting dish. Splitting the axes fixes both directions at once.

Two category values were retired into `veggie`: `baked`, which named a technique rather than a dish, and `salad`, which was simply `veggie` + `raw`.

**When a dish uses several vessels** (pasta boiled while the sauce fries, meat seared then roasted), the method is the vessel where the dish reaches its *final* state — seared-then-roasted pork is `oven`, not `pan`.

**No grill and no microwave**, deliberately: a grill isn't in every kitchen and we're aiming at the widest possible audience. The prompt forbids recipes that require one.

The valid pairs live in [`src/lib/cookingMethods.ts`](src/lib/cookingMethods.ts) and are shared by the generator and the UI. Scenes are in [`src/components/icons/dishes/scenes/`](src/components/icons/dishes/scenes), built on shared `OvenFrame` / `PotFrame` / `PanFrame` chassis so the same cookware can't drift between scenes. See [docs/RECIPE_GENERATION.md](docs/RECIPE_GENERATION.md) for the full reasoning.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd my-cheap-chef
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run data:parse` | Parse products via Lidl API |
| `npm run catalog:ingest` | *(planned)* Parse catalog images via Vision AI |
| `npm run recipe:generate` | *(planned)* Generate recipes via AI |

## 📊 Data Flow

1. **Weekly (Saturday night):** Script parses supermarket catalog images → `data/products.json`
2. **After parsing:** Script generates recipes → `data/recipe.json`
3. **Client:** Reads JSON → displays discounted products + recipe of the week
4. **Paid feature (future):** On-demand recipe generation

## ✅ Roadmap

- [x] Prototype: fetching data via Lidl API (limited)
- [ ] Catalog parsing via Vision AI
- [ ] Recipe generation via Text AI
- [ ] UI: product list + recipe of the week
- [ ] PWA support
- [ ] Deployment to Vercel
- [ ] Multi-store support (Kaufland, etc.)
- [ ] Filters (vegetarian, quick meals, no oven, etc.)
- [ ] Shopping list generation
- [ ] Geo expansion (Slovakia → Czechia → Poland → Germany)

## 📄 License

This project is private and not yet licensed for public distribution.
