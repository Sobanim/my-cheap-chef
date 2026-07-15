# GitHub Copilot Instructions - My Cheap Chef (Varím zo zliav)

This file defines the coding guidelines, architectural patterns, repository standards, and code review criteria for **My Cheap Chef** (Varím zo zliav). GitHub Copilot must adhere to these instructions when writing code, answering questions, or performing Pull Request code reviews.

---

## 1. Project Overview & Context

- **App Name**: My Cheap Chef (Varím zo zliav)
- **Purpose**: A web application that lists discounted supermarket products (currently Lidl Slovakia) and generates budget-friendly recipes from them using AI.
- **Tech Stack**:
  - **Framework**: Next.js 16 (App Router)
  - **Library**: React 19 with React Compiler (`babel-plugin-react-compiler`)
  - **Styling**: SCSS Modules (uses standard SASS)
  - **HTTP Client**: Axios (used in data ingestion scripts)
  - **State Management**: None (React Server Components are primary)
  - **Database**: Pre-computed JSON files under `data/`, updated weekly by cron/ingestion scripts.

---

## 2. Directory Structure & Architecture

```
my-cheap-chef/
├── scripts/              ← Standalone TypeScript scripts run via tsx (e.g., ingest, recipe generation)
├── data/                 ← JSON files serving as our database (committed to Git)
│   └── catalog-images/   ← Downloaded images (gitignored)
├── public/               ← Static assets
├── src/
│   ├── app/              ← Next.js App Router (RSCs read JSON files directly from disk)
│   │   └── api/          ← Next.js Route Handlers serving data/*.json (no heavy logic)
│   ├── lib/              ← Shared types, utilities, and constants (framework-agnostic)
│   │   ├── types/        ← Domain types (product, recipe, lidl, etc.)
│   │   └── services/     ← API clients and data fetching logic
│   └── components/       ← UI React components (each component has its own folder)
```

---

## 3. Strict Coding Standards & Conventions

### 3.1 Component Conventions
- **Declaration**: All component functions must be declared as arrow functions:
  ```typescript
  export const ComponentName = ({ props }: Readonly<Props>) => {
    return <div />;
  };
  ```
  *Do NOT use `export default function ComponentName` style.*
- **Props**: Wrapping props in `Readonly<>` is mandatory.
- **Structure**: Each component must reside in its own folder: `src/components/ComponentName/ComponentName.tsx` + `ComponentName.module.scss`.
- **Barrel Exports**: All components must be exported from the folder's entry point and re-exported via the barrel file at `src/components/index.ts`.
- **Import Style**: Always import components using the `@/components` path alias.

### 3.2 TypeScript Conventions
- **Types vs Interfaces**: Use `type` aliases instead of `interface` declarations for all props, states, and data models:
  ```typescript
  type ProductCardProps = {
    product: Product;
    isUpcoming?: boolean;
  };
  ```
- **Path Aliases**: Always use `@/lib/types` and other `@/*` path mappings. Avoid deep relative imports (e.g., `../../lib/types/product`).

### 3.3 Styling & CSS
- **No Tailwind CSS**: Do NOT use utility-first CSS frameworks like Tailwind.
- **SCSS Modules only**: Put all styles in `.module.scss` files.
- **No Inline Styles**: Avoid inline style attributes. Define styles in the SCSS module.

### 3.4 Language Rules (CRITICAL)
- **UI Text / Labels**: Must be in **Slovak** (Slovenčina) only.
- **Code Comments**: Must be in **English**.
- **Logs / Error Messages**: Must be in **English**.
- **Variable & Type Names**: Named in **English** (camelCase for variables, PascalCase for types).

### 3.5 Data Access & API Routes
- **Next.js Server Side**: Next.js pages and API Route Handlers read from the `data/` directory using:
  ```typescript
  path.join(process.cwd(), 'data', '...')
  ```
- **Cron / Standalone Scripts**: Scripts executing from the `scripts/` directory use:
  ```typescript
  path.join(__dirname, '..', 'data', '...')
  ```
- **API Route Principle**: API routes must only serve pre-computed JSON files or forward requests. They should **never** run heavy computations (like parsing catalogs or generating recipes via AI).

---

## 4. Senior Developer Guidelines (Readability, Clarity, and Quality)

To ensure the code remains clean, easy to read, performant, and maintainable, Copilot should enforce the following engineering principles during creation and review:

### 4.1 Simplicity & Readability
- **Low Nesting (Guard Clauses)**: Avoid deep nested structures (maximum of 2-3 levels of nesting). Use early returns (guard clauses) to exit functions early when conditions are not met:
  ```typescript
  // Prefer this:
  if (!product.price || product.price <= 0) return null;
  // ... rest of the code
  ```
- **Keep Functions Small**: Focus each function/component on a single responsibility.
  - Component files should ideally be under **150 lines**.
  - Utility/helper functions should ideally be under **30 lines**. If a function gets too large, split it.
- **Self-Documenting Code**: Choose descriptive variable and function names (verbs for functions, e.g., `calculateSavings`, nouns for variables, e.g., `discountedPrice`). Code readability is preferred over brief but cryptic names.

### 4.2 TypeScript Strictness & Type Safety
- **No `any`**: The use of `any` is strictly prohibited. If a type is unknown (e.g., from an external API), use `unknown` and perform type narrowing/validation.
- **Defensive Null/Undefined Checks**: Always use optional chaining (`?.`) and nullish coalescing (`??`) when accessing values that could be missing in JSON data or API responses.

### 4.3 Error Handling & Resilience
- **Graceful Degradation**: Always catch filesystem and API fetch operations with `try-catch` blocks.
- **User-Friendly Fallbacks**: When an error occurs on the client or server, do not crash the UI or print raw system errors. Provide a clean fallback (e.g., `<EmptyState />` or a user-friendly message in Slovak like *"Údaje sa nepodarilo načítať"*).

### 4.4 React & Next.js Best Practices
- **Server Components by Default**: Leave components as Server Components unless interactivity (event listeners, state hooks, browser APIs) is required. Place `'use client'` only at the top of small, leaf-node files.
- **Dynamic List Keys**: When rendering list items via `.map()`, never use the array index as the `key` prop if items can be sorted, filtered, or added dynamically. Always use a unique identifier (like `product.id` or `recipe.id`).

### 4.5 Avoiding Code Smells ("Silly Mistakes")
- **No Dead/Commented-Out Code**: Never commit commented-out code blocks. If code is unused, delete it. Git history exists to recover it later.
- **No Magic Numbers/Strings**: Extract raw configurations (timeouts, limit bounds, constant phrases) into constants (either locally or in a shared file like `src/lib/constants.ts`).

---

## 5. Key Developer Commands

- `npm run dev` — Starts the Next.js development server
- `npm run build` — Builds the application for production
- `npm run lint` — Runs ESLint checks
- `npm run data:parse` — Runs script to parse Lidl API products into `data/products.json`
- `npm run catalog:ingest` — Parse catalog images via Vision AI (WIP)
- `npm run recipe:generate` — Generate weekly recipes via LLM (WIP)

---

## 6. Pull Request (PR) Code Review Guidelines

When asked to review a Pull Request or a diff of changes, GitHub Copilot must verify the following checks and call out violations in a professional, constructive manner:

### PR Checklist for Copilot:
1. **Design System & Styling**:
   - Are there any Tailwind CSS classes or utility-first frameworks used? (Flag as error)
   - Are there any inline `style={{ ... }}` attributes? (Suggest moving them to SCSS modules)
   - Are the style files using the `.module.scss` extension?
2. **Component Conventions**:
   - Are React components defined as arrow functions? (`export const ComponentName = ...`)
   - Are props wrapped in `Readonly<>`?
   - Is the component placed in a separate directory with its own `.module.scss` file?
   - Is the component re-exported through `src/components/index.ts`?
3. **TypeScript & Types**:
   - Are there any `interface` definitions? (Flag them and ask to convert to `type` aliases)
   - Are there any occurrences of `any`? (Suggest exact types or type assertions)
   - Are imports using `@/components` or `@/lib/types` path aliases instead of relative paths?
4. **Code Readability & Smells**:
   - Is there any commented-out code that should be deleted?
   - Are there hardcoded "magic numbers" or config parameters inline?
   - Are there deep nested blocks of logic (more than 3 levels)? Recommend refactoring with guard clauses or breaking it into sub-helper functions.
5. **Language & Content**:
   - Is all user-facing UI text in **Slovak**?
   - Are code comments, JSDoc, logging statements, and variables written in **English**?
6. **Data & Server Rules**:
   - Do Next.js files access the database using `process.cwd()`?
   - Do scripts files access the database using `__dirname`?
   - Are API Route Handlers running heavy processes like parser routines or AI generation? (Route handlers must only read/write static pre-computed JSON)
   - Are filesystem and API operations safely wrapped in `try-catch` blocks?
7. **React Performance**:
   - Are list elements using array indices as `key` props? (Flag as warning/error)
   - Is `'use client'` used unnecessarily in non-interactive components?
