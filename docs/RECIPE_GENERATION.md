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

**Na `buy` je strop: maximálne JEDNA položka na recept, ideálne nula.** Kritérium nie je cena
(soľ je tiež lacná, a pritom z akciového kurčaťa večeru neurobí), ale dve iné veci:

1. **Rola** — musí to byť sýty základ/príloha, bez ktorej z akciovej suroviny nevznikne
   plnohodnotná večera (cestoviny, ryža, zemiaky, kuskus, strukoviny, múka). V prompte je ten
   výpočet výslovne označený ako príklad, nie uzavretý zoznam — inak by sme si doň nasťahovali
   presne ten cenník, ktorý sme v 6b zamietli.
2. **Spotrebuje sa** — balenie do ~1.50 €, z ktorého jedlo použije aspoň polovicu, alebo zvyšok
   vydrží mesiace v skrini. Zakázané sú suroviny, kde zákazník platí celé balenie za pár gramov:
   koreniny, omáčky, orechy, smotana, jogurt, zelenina na ozdobu.

Vynucuje to prompt ([recipe-prompt.ts](../scripts/lib/recipe-prompt.ts), sekcia
`ČO SMIE BYŤ "buy"`) + editor pass nesmie počet `buy` položiek zvýšiť nad jednu; skript navyše
loguje warning pri `buy > 1`. V UI je to na karte vidieť ako chip **„Bez dokupovania"** /
**„+1 na dokúpenie"** — je to najsilnejší signál, ktorý máme, preto je pred klikom.

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

`approxCost` sa počíta rovnako v kóde zo `sale` podielov.

### 6b. Čo NEoceňujeme a prečo (`buy` položky)

**Položky `buy` nemajú cenu a mať ju nebudú.** Zvažovali sme ručný cenník bežných surovín
(`cestoviny, ryža, zemiaky…`) — **zamietnuté** z troch dôvodov:

- **Kvalita nie je jedna cena.** Cestoviny sú za 0.50 € (mäkká pšenica, zlé jedlo) aj za 0.89 €
  (durum). Jedna cena v tabuľke by tichým predpokladom rozhodovala o kvalite jedla.
- **Sezónnosť.** Zemiaky, zelenina a ovocie sa v cene hýbu podľa úrody — číslo v súbore zastará
  bez toho, aby to čokoľvek nahlásilo.
- **Neúplné dáta.** Z Lidl API ťaháme jednu kategóriu (`fetchsize=50`), letáky nepokrývame.
  Čím menej úplné sú naše dáta, tým menej máme stavať nad nimi vlastné tvrdenia o cenách.

Namiesto toho platí: **tvrdíme len to, čo tvrdí Lidl sám** — `price` vs. `oldPrice` na tých
produktoch, ktoré sme do receptu dali. Cenu mimo akcie nikde nevymýšľame.

### 6c. Odvodené čísla pre UI

[src/lib/recipeMoney.ts](../src/lib/recipeMoney.ts), `getRecipeMoney()` — jediné miesto, kde sa
peniaze pre UI počítajú, aby sa karta a detail nerozišli. **Žiadne nové polia v `recipe.json`**:

```
regularCost    = approxCost + totalSavings   // obe polia pokrývajú presne sale suroviny
savingsPercent = totalSavings / regularCost
```

Preto staré recepty (vygenerované pred touto zmenou) renderujú správne a netreba regenerovať.

Zobrazenie: **„2.52 € ~~4.09 €~~ −38 %, za 2 porcie"**. Absolútna úspora sa už nezobrazuje ako
hlavné číslo — „ušetríte 0.79 €" je čitateľ bez menovateľa a číta sa ako nič, kým to isté číslo
ako −21 % má význam. Percento je zároveň jediná hodnota **porovnateľná medzi kartami**: úspora
1.57 € vyzerá slabšie ako 1.84 €, hoci je to −38 % vs. −30 %.

**`SAVINGS_MIN_PERCENT = 15`** — pod týmto prahom karta ukáže iba cenu, bez preškrtnutej ceny
a bez percenta. „−3 %" pri preškrtnutých 4.12 € pôsobí ako naťahovanie neexistujúcej zľavy
a stojí viac dôvery, než koľko získa.

**Cena za porciu sa zámerne nezobrazuje.** Delenie na porcie by z tej istej sumy urobilo
opticky menšie číslo (1.26 € namiesto 2.52 €), čo je hra s číslami, nie informácia — zákazníka
zaujíma, čo zaplatí pri kase. Namiesto toho je pri cene napísané, **na koľko ľudí** platí:
`servings` sa až doteraz nikde v UI nezobrazovalo, takže cena visela bez odpovede na otázku
„pre koľkých to je".

## 7. Filtrovanie produktov

- **Žiadny keyword hard-filter** v kóde (deravý — nechytí Kofolu, Birell, Radler…).
- Filtrovanie rieši **model cez prompt**: ignorovať nápoje, hotové dezerty/zmrzliny, non-food.
- **Alkohol**: nie je zakázaný úplne — smie sa použiť **len ako súčasť varenia** (marináda, deglazovanie), nikdy ako nápoj či hlavná zložka.

## 8. Kategórie jedál a SVG ikony

Fotky jedál negenerujeme (nepredvídateľné, škaredé, drahé). Namiesto toho vopred pripravené **animované SVG scény**.

Scéna sa vyberá podľa **dvojice `category` + `cookingMethod`**, nie podľa samotnej kategórie.

**Prečo dve osi.** Pôvodne bola len `category`, a tá musela naraz odpovedať na dve nesúvisiace otázky: *čo to za jedlo je* a *ako sa pripravuje*. Výsledkom boli zjavne nesprávne ikony — kuracie stehná pečené v rúre sú `meat`, `meat` mapovala na jedinú scénu s panvicou, takže sa jedlo z rúry kreslilo na panvici. Opačný prípad: opekaný syr na panvici spadol pod vtedajšie `baked` a kreslil sa ako pekáč. Rozdelenie osí je jediná oprava, ktorá rieši oba smery naraz.

| `category` (čo to je) | Popis |
|------------|-------|
| `meat` | mäso alebo ryba je hlavná zložka |
| `pasta` | cestoviny / ryža / obilnina ako základ |
| `soup` | prevažne tekuté jedlo, je sa lyžicou |
| `veggie` | zvyšok, kde dominuje zelenina alebo syr |
| `dessert` | sladké jedlo |

| `cookingMethod` (ako sa robí) | Popis |
|------------|-------|
| `pan` | panvica na sporáku |
| `oven` | rúra / pekáč |
| `pot` | hrniec — varenie, dusenie |
| `raw` | bez tepelnej úpravy |

**Zrušené hodnoty.** `baked` bola jediná hodnota enumu, ktorá popisovala techniku a nie jedlo — po zavedení `cookingMethod` by vznikla samo-protirečivá dvojica `baked + pan` („zapekané, pripravené na panvici"). `salad` zas bola dvojica `veggie + raw` napísaná ako samostatná kategória: šalát JE surová zelenina (prípadne so syrom). Ponechať obe by znamenalo, že `salad + pan` a `veggie + pan` sú dva názvy pre jeden a ten istý obrázok. Obe hodnoty teraz pokrýva `veggie` s príslušnou metódou.

V UI sa dvojica `veggie + raw` zobrazuje ako „Šalát" — viď `PAIR_LABELS` v [src/lib/recipeLabels.ts](../src/lib/recipeLabels.ts). Je to jediná dvojica, ktorá potrebuje vlastný názov; ostatným stačí názov kategórie.

**Ak jedlo používa viac nádob** (cestoviny sa varia, omáčka opeká; mäso sa opečie a ide do rúry), platí nádoba, v ktorej jedlo **dospeje do finálnej podoby**. Panenka opečená a dopečená v rúre je `oven`.

**Gril ani mikrovlnka nie sú v enume zámerne** — gril nemá doma zďaleka každý a cieľom je čo najširšie publikum; varenie v mikrovlnke nechceme. Prompt priamo zakazuje recepty, ktoré gril vyžadujú.

Obe polia sú vynútené cez `responseSchema` + zod. Zvažovali sme namiesto toho `category` ako polymorfné pole (raz string, raz objekt s technikou) — **zamietnuté**, lebo `responseSchema` u Gemini je podmnožina OpenAPI bez union typov; pole by sa muselo uvoľniť a prišli by sme o štruktúrovaný výstup.

Zoznam zmysluplných dvojíc (14 z 20 — `meat + raw`, `dessert + pot` a spol. nedávajú zmysel) žije v [src/lib/cookingMethods.ts](../src/lib/cookingMethods.ts) a používa ho aj generátor, aj UI. Dvojicu mimo zoznamu generátor zloguje a spadne na predvolenú metódu kategórie; rovnaký fallback kreslí aj UI, takže scéna nikdy nie je prázdna.

Pozor na rozdiel: **`VALID_DISH_KEYS` riadi, aké jedlá sa smú generovať; mapa `SCENES` riadi, čo je nakreslené.** Nemusia sa zhodovať. Platná dvojica bez scény jednoducho spadne na predvolenú — dvojicu nikdy nemaž zo zoznamu len preto, že jej obrázok ešte nie je hotový, inak model prestane taký typ jedla navrhovať.

### 8b. Pravidlá kreslenia scén

Celá matica scén je zachytená v [dish-scene-matrix.svg](dish-scene-matrix.svg) a vložená do [README](../README.md). **Po každej zmene scény ten súbor aktualizuj** — je to jediné miesto, kde je celá sada vidieť naraz, a práve tam sa nezrovnalosti odhalia.

Scény zdieľajúce nádobu stavajú na spoločnom podvozku z [src/components/icons/dishes/parts/](../src/components/icons/dishes/parts): `OvenFrame`, `PotFrame`, `PanFrame`. Nekopíruj nádobu do scény priamo — štyri kópie rúry sa nevyhnutne rozídu.

Toto NIE je tá kompozícia „nádoba + náplň", ktorú sme zamietli. Zamietnutá bola všeobecná kompozícia naprieč VŠETKÝMI nádobami: panvica sa kreslí zhora, rúra spredu, takže jeden normalizovaný tvar jedla nemôže sedieť v oboch. Podvozok zdieľajú len scény s rovnakým pohľadom.

Stĺpec metódy ukazuje nádobu, v ktorej sa **varí**, nie v ktorej sa servíruje. Polievka preto sedí v hrnci, nie v miske — miska bola pôvodná verzia a bola to presne tá istá chyba, kvôli ktorej vznikol celý dvojosový model, len na inom mieste.

Paleta (drž sa jej, nové odtiene nepridávaj bez dôvodu):

| Použitie | Farby |
|---|---|
| Obrys náradia | `currentColor` (prepína sa s témou), `strokeWidth` 1.7 |
| Teplo a para | `#ff6d00`, `#ffd600` |
| Mäso | `#d85a30`, tmavý zárez `#4a1b0c` |
| Cestoviny, vývar | `#ef9f27`, `#ba7517` |
| Zelenina | `#639922`, `#3b6d11`, `#97c459` |
| Paradajka / bobuľa | `#e24b4a` |
| Dezert | `#ed93b1`, `#d4537e` |

Animácie ber z existujúcich tried v `DishScene.module.scss` (`steamA/B/C`, `heatA/B/C`, `bob`, `leaf`). Novú `@keyframes` pridávaj len ak žiadna nesedí — a vždy ju dopíš aj do bloku `prefers-reduced-motion`.

Para vs. teplo: `steamRise` sa posúva o -9px a je pre otvorené nádoby. V rúre použi `heatRise` (-2.2px) — vlnky musia ostať ZA sklom. Para stúpajúca z rúry sa číta ako požiar, nie ako pečenie; to je dôvod, prečo tá druhá animácia existuje.

### 8c. Známe slabé miesta matice

- **`pasta:pot` bude takmer vždy prázdna.** Pravidlo finálnej nádoby hovorí, že cestoviny sa síce varia v hrnci, ale dochádzajú s omáčkou na panvici — čiže `pan`. Aby ostali `pot`, muselo by jedlo v hrnci aj skončiť (polievka s rezancami). Scéna existuje, len sa použije zriedka.
- **`dessert:pan` je najslabšia scéna sady.** Zlatý disk na panvici sa číta ako omeleta rovnako ľahko ako palacinka; „sladké" nesie len bobuľa navrchu. Ak prestane fungovať, zmaž riadok z `SCENES` — dvojica spadne na `dessert:raw`. Zo `VALID_DISH_KEYS` ju NEMAŽ.

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
