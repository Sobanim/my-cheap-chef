# Generovanie receptov cez AI (Design Decisions)

Tento dokument fixuje produktové a technické rozhodnutia pre generovanie receptov v `scripts/generate-recipe.ts`. Nadväzuje na [RECIPE_SYSTEM.md](./RECIPE_SYSTEM.md) (systém košov A/B/C a 6 receptov na týždeň).

---

## 1. AI Provider

- **Model**: `gemini-3.1-flash-lite` (Google AI Studio API). Pozn.: `gemini-2.5-flash` prestal byť dostupný (API hlásilo „model not supported"), preto sme prešli na Gemini 3.1. Pestrosť receptov sme vyriešili promptom (nové vs. prenesené produkty + dedup jedál), nie väčším modelom.
- **Prečo**: štedrý free tier (potrebujeme ~3 requesty týždenne), podpora **structured output** (`responseSchema` — model vracia striktný JSON podľa schémy, nie voľný text), rovnaký provider neskôr poslúži aj pre Vision AI v `ingest-catalog.ts`.
- Generovanie beží **offline v skripte** (`npm run recipe:generate`), výsledok sa commituje do `data/recipe.json`. Web ostáva statický, žiadne AI volania za behu.
- **Jazyk receptov**: slovenčina.

## 2. Generovanie po fázach

Podľa košov z [RECIPE_SYSTEM.md](./RECIPE_SYSTEM.md):

| Fáza | Dostupné produkty | Výstup |
|------|-------------------|--------|
| A (od pondelka) | kôš A | 2 recepty |
| B (od štvrtka) | koše A + B | 2 recepty |
| C (víkend) | koše A + B + C | 2 recepty |

Jeden prompt na fázu (3 requesty spolu). V každej fáze žiadame **2 rôzne recepty** — typ jedla (mäsové / vegetariánske / …) si volí model sám, nefixujeme ho.

### Pestrosť medzi fázami (dedup)

Keďže kôš B ⊇ A a C ⊇ B, model má tendenciu opakovať tie isté „hviezdne" produkty a generovať v každej fáze rovnaké jedlo (napr. A1 = B1). Riešime to dvomi pákami:

1. Produkty v prompte sú rozdelené na **NOVÉ v tejto fáze** (kôš == kôš fázy) a **stále platiace z predchádzajúcich dní**. Model má uprednostniť nové (mäkké odporúčanie, nie zákaz).
2. Do promptu ďalších fáz posielame **„title — description" už vygenerovaných jedál** so zákazom zopakovať ten istý koncept. Rovnakú surovinu použiť MÔŽE, ale jedlo musí byť iné.

Cieľ nie je unikátnosť surovín (jeden hlavný produkt vo viacerých jedlách je OK), ale to, aby **žiadne dve jedlá neboli to isté jedlo**.

### Zdroj produktov

Skript si ťahá **živý zoznam** z Lidl API cez `fetchActiveProducts()` ([src/lib/services/lidlService.ts](../src/lib/services/lidlService.ts)) — **nie** zo statického `data/products.json`. Web zobrazuje produkty tiež živo (rovnaký zdroj), takže `productId` v recepte sedí s tým, čo web ukazuje. (V tsx skripte sa `next.revalidate` option ignoruje — bežný `fetch`.)

## 3. Domáca špajza (base pantry)

Minimálny, nesporný zoznam toho, čo predpokladáme doma:

> **soľ, čierne korenie, cukor, rastlinný olej, voda, vajcia**

Všetko ostatné (cibuľa, cesnak, múka, koreniny…) sa **nepredpokladá** — ak to recept potrebuje, ide do kategórie „dokúpiť" (`buy`). Tým sa vyhýbame hádaniu, čo má používateľ doma.

## 4. Ingrediencia = objekt s tromi zdrojmi

```typescript
type RecipeIngredient = {
  name: string;              // display name, e.g. "Mleté hovädzie mäso"
  amount: string;            // "200 g", "2 ks", "1 PL"
  source: 'sale' | 'pantry' | 'buy';
  productId?: string;        // only for 'sale' — link to products.json
  savings?: number;          // only for 'sale' — computed in code (€)
};
```

- `sale` — akciový produkt (hlavná hodnota appky)
- `pantry` — zo špajze (bod 3)
- `buy` — treba dokúpiť (nie je v akcii)

Obrázok/plnú kartu produktu neduplikujeme v `recipe.json` — ťahá sa cez `productId` z `products.json`.

## 4b. Čas a náročnosť

Dve samostatné polia, aby dlhé pasívne pečenie nerobilo z jednoduchého jedla „ťažké":

- **`estimatedTime`** — celkový čas od začiatku po servírovanie, **vrátane predhriatia rúry**.
- **`activeTime`** — iba čas, keď človek reálne pracuje (krájanie, opekanie). Pasívne čakanie sa nepočíta.
  Napr. bôčik: `estimatedTime` 90 minút, `activeTime` 15 minút.
- **`difficulty`** hodnotí **výhradne náročnosť techniky**, nikdy nie dĺžku prípravy. Jedlo, ktoré sa 90 minút
  samo pečie, je `easy`.

V UI zobrazovať oboje (napr. „90 min celkovo · 15 min pri sporáku"), aby používateľ videl reálnu investíciu času.

## 5. Porcie a balenia

- **`servings: 2`** — balenia Lidla (400 g mäso, 250 g mozzarella…) sa delia na 2 porcie prirodzene; jedna osoba to zje 2× (obed + večera).
- Prompt inštruuje model **rešpektovať `packInfo`** — žiadne „50 g z balenia 400 g".

## 6. Výpočet úspor (totalSavings)

Peniaze **nepočíta LLM** (nespoľahlivá aritmetika). Model vráti pre každú `sale` ingredienciu `productId` + `packFraction` = počet použitých balení/kusov (`0.5` = pol balenia, `2` = dve balenia — napr. dve kukurice predávané na kus; max 10). Skript počíta deterministicky:

```
savings = (oldPrice − price) × podiel_balenia   // len ak oldPrice > price
totalSavings = suma cez všetky sale ingrediencie
```

Zobrazenie: „Ušetríte ~2.40 €". `approxCost` (orientačná cena jedla) sa počíta rovnako v kóde zo `sale` podielov (+ hrubý odhad `buy` položiek od modelu).

## 7. Filtrovanie produktov

- **Žiadny keyword hard-filter** v kóde (deravý — nechytí Kofolu, Birell, Radler…).
- Filtrovanie rieši **model cez prompt**: ignorovať nápoje, hotové dezerty/zmrzliny, non-food.
- **Alkohol**: nie je zakázaný úplne — smie sa použiť **len ako súčasť varenia** (marináda, deglazovanie), nikdy ako nápoj či hlavná zložka.

## 8. Kategórie jedál a SVG ikony

Fotky jedál negenerujeme (nepredvídateľné, škaredé, drahé). Namiesto toho **fixný enum kategórií podľa TYPU jedla** (nie času konzumácie — „obed" a „večera" sa nedajú vizuálne odlíšiť). Každej kategórii zodpovedá vopred pripravená **animovaná SVG ikona**:

| `category` | Popis | Ikona |
|------------|-------|-------|
| `meat` | mäso / gril | kus mäsa na grile |
| `pasta` | cestoviny / rizoto / ryža | tanier s vidličkou |
| `soup` | polievky / guláše | miska s parou |
| `salad` | šaláty / studené jedlá | miska zeleniny |
| `baked` | zapekané / z rúry | pekáč |
| `dessert` | sladké / ovocie | koláč |

Model **musí** vybrať z enumu (vynútené cez `responseSchema` + zod). Fallback pri neznámej hodnote: neutrálna ikona taniera.

## 9. Kroky prípravy

`steps: string[]` — **pole reťazcov, jeden krok = jeden prvok**. Vynútené schémou, žiadne parsovanie textu. UI renderuje ako `<ol>`.

## 9b. Kvalita krokov (recept ako návod, nie inšpirácia)

Prvé reálne behy ukázali, že model píše ingrediencie a kroky ako dva nezávislé texty — množstvá sa v krokoch neopakujú („pridáme marhule" namiesto „300 g marhúľ"), chýbajú časy/teploty, jednotky sa menia recept od receptu (`PL` vs `polievková lyžica`), a niekedy si názov/popis/kroky odporujú (napr. názov „brandy", surovina „vodka").

Riešime na dvoch úrovniach:

- **Vrstva 1 — pravidlá v prompte** ([scripts/lib/recipe-prompt.ts](../scripts/lib/recipe-prompt.ts), sekcie `PRAVIDLÁ PRE KROKY` a `REALISTICKOSŤ`): každá surovina sa musí objaviť v kroku s presným množstvom, zakázané vágne výrazy bez čísla, povinný čas/teplota pri tepelnej úprave, jednotná terminológia (`g/ml/ks/PL/ČL`, 1. osoba množného čísla), zákaz vyžadovať kúpu celej drahej fľaše alkoholu kvôli pár ml.
- **Vrstva 2 — lacné kontroly v kóde** ([scripts/generate-recipe.ts](../scripts/generate-recipe.ts), `runSanityChecks`): po vygenerovaní receptu skript len **loguje warningy** (nepadá) pri vágnych výrazoch (`trochou`, `podľa potreby`), chýbajúcej teplote/čase pri zmienke rúry/minút, a neznámom `productId`. Slúži ako signál v logoch cronu, nie ako blokujúca validácia — slovenské pády neumožňujú spoľahlivo strojovo overiť, či sa surovina reálne použila v kroku.

**Vrstva 3 — kulinársky editor (implementované):** druhý AI request na fázu ([scripts/lib/editor-prompt.ts](../scripts/lib/editor-prompt.ts), `runEditorPass` v generte skripte). Vygenerovaný draft JSON sa pošle modelu v roli „redaktor kuchárskej knihy" s checklistom kulinárskej logiky, ktorú pravidlá nevedia pokryť: poradie krokov (príloha súbežne, nie 15 min vopred), realistické časy pre daný kus mäsa/hrúbku, suroviny púšťajúce vodu, poctivosť názvu (žiadne „karé" pri stehnách či „ragú" bez tekutiny). Editor NESMIE meniť `productId`/`source`/koncept jedla; `packFraction` smie opraviť. Ak editor pass zlyhá, skript loguje warning a ponechá draft (graceful fallback). Peniaze sa počítajú až PO editor passe. Dôvod vzniku: 2. reálny beh mal správny formát, ale kulinárske chyby (cestoviny uvarené 15 min pred omáčkou, surová kukurica v suchej rúre, presušené prsia, soľ 2× oproti zoznamu).

## 10. Validácia odpovede AI

- **zod** schéma validuje JSON od modelu za behu skriptu (TS typy v runtime neexistujú).
- Pri nevalidnej odpovedi skript spadne s jasnou chybou — nezapíše sa pokazený `recipe.json`.
- TODO (neskôr): retry s opravným promptom, ak model vráti nevalidný JSON.

## 11. Tags — odložené (v2)

Pole `tags` (napr. „vegetariánske") zatiaľ nezavádzame — vráti sa pri personalizácii.

## 12. Spustenie a automatizácia

- **Manuálne (dev)**: `npm run recipe:generate`.
- **Cron**: workflow `.github/workflows/ingest.yml` sa premenováva na generovanie receptov (napr. `Weekly Recipe Generation`). Kroky: fetch živých produktov + generovanie → commit iba `data/recipe.json`. `workflow_dispatch` zostáva pre manuálne spustenie z Actions. Samostatný commit `products.json` už nerobíme (web číta produkty živo).

## 13. Budúcnosť: cieľová skupina a monetizácia (v2)

**MVP (teraz)**: statický web, 6 receptov/týždeň, bez backendu, hosting zadarmo. Cieľovka: ľudia variaci lacno (študenti, páry, jednotlivci) — nie platiaca skupina; táto fáza validuje nápad.

**v2 (odložené)**: používateľské profily + personalizované generovanie za predplatné (orientačne ~3 €/mes. základ, ~6 €/mes. plná personalizácia — ceny TBD). Profil: športovec/viac bielkovín, vegetarián, rodina na N osôb… Vyžaduje registráciu, backend, DB — zámerne odložené.

**Dôsledok pre dnešný kód**: prompt a typy držať rozšíriteľné — `servings` je už v schéme, sekcia „profil používateľa" sa do promptu neskôr len pridá.
