/**
 * Builds the Slovak prompt sent to Gemini for one promo phase.
 * The recipe JSON shape itself is enforced separately via responseSchema.
 */

import type { Product } from '@/lib/types';
import { BASE_PANTRY_ITEMS } from '@/lib/types';

type BuildRecipePromptArgs = {
  phaseLabel: string;
  /** Products newly discounted in this phase — recipes should lean on these. */
  newProducts: Product[];
  /** Still-valid products carried over from earlier phases — usable as support. */
  carriedProducts: Product[];
  /** "Title — description" of recipes already generated in earlier phases. */
  previousDishes: string[];
};

/** Formats one product as a single prompt line the model can reference by id. */
const formatProduct = (product: Product): string => {
  const original =
    product.oldPrice && product.oldPrice > product.price
      ? ` | pôvodne ${product.oldPrice.toFixed(2)} €`
      : '';
  const pack = product.packInfo || 'neuvedené';
  return `- ${product.id} | ${product.name} | ${product.price.toFixed(2)} € | ${pack}${original}`;
};

/** Renders a product section, or a placeholder when the list is empty. */
const formatProductSection = (products: Product[], emptyText: string): string => {
  if (products.length === 0) return emptyText;
  return products.map(formatProduct).join('\n');
};

/** Builds the "avoid repeating these dishes" block, empty for the first phase. */
const formatPreviousDishesBlock = (previousDishes: string[]): string => {
  if (previousDishes.length === 0) return '';

  const list = previousDishes.map((dish) => `- ${dish}`).join('\n');
  return `
UŽ NAVRHNUTÉ JEDLÁ V INÝCH FÁZACH (nesmieš zopakovať to isté jedlo):
${list}

Rovnakú surovinu môžeš použiť znova, ale KAŽDÉ jedlo musí byť odlišné konceptom a spôsobom prípravy od vyššie uvedených.
`;
};

/**
 * Assembles the full prompt for a given phase and its available products.
 */
export const buildRecipePrompt = ({
  phaseLabel,
  newProducts,
  carriedProducts,
  previousDishes,
}: BuildRecipePromptArgs): string => {
  const pantry = BASE_PANTRY_ITEMS.join(', ');
  const newSection = formatProductSection(newProducts, '(žiadne)');
  const carriedSection = formatProductSection(carriedProducts, '(žiadne — toto je prvá fáza)');
  const previousBlock = formatPreviousDishesBlock(previousDishes);

  return `Si skúsený kuchár, ktorý navrhuje LACNÉ jedlá z týždňových zliav v Lidli (Slovensko).

FÁZA: ${phaseLabel}

NOVÉ AKCIE V TEJTO FÁZE (id | názov | cena | balenie | pôvodná cena):
${newSection}

STÁLE PLATIACE AKCIE Z PREDCHÁDZAJÚCICH DNÍ (id | názov | cena | balenie | pôvodná cena):
${carriedSection}

DOMÁCA ŠPAJZA (predpokladáme, že to zákazník má doma, netreba kupovať):
${pantry}
${previousBlock}
ÚLOHA:
- Navrhni PRESNE 2 rôzne recepty. Typ jedla si zvoľ sám (mäsové, vegetariánske, sladké...), nech sú navzájom odlišné.
- Jedlá musia byť postavené HLAVNE na akciových produktoch vyššie.
- Kvôli pestrosti UPREDNOSTNI nové akcie v tejto fáze; staršie akcie môžeš použiť ako doplnok.
- Varíme pre 2 osoby. Rešpektuj veľkosti balení (napr. neber 50 g z balenia 400 g).

PRAVIDLÁ PRE SUROVINY:
- Každá surovina má "source": "sale" (z akcie vyššie), "pantry" (domáca špajza) alebo "buy" (treba dokúpiť, nie je v akcii).
- Pri surovinách "sale" uveď "productId" (id zo zoznamu vyššie) a "packFraction" = aká časť uvedeného množstva/balenia sa použije (0.0 – 1.0).
- Ignoruj nápoje, hotové zmrzliny a dezerty a nepotravinový tovar.
- Alkohol použi LEN ako súčasť varenia (marináda, deglazovanie), nikdy nie ako nápoj.

FORMÁT ODPOVEDE:
- Odpovedaj PO SLOVENSKY.
- Vráť striktne JSON podľa poskytnutej schémy, bez textu navyše.
- "category" musí byť jedna z: meat, pasta, soup, salad, baked, dessert.
- "difficulty" musí byť "easy" alebo "medium".
- "steps" je pole krokov, kde jeden krok = jeden prvok poľa.`;
};
