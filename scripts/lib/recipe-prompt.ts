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
- Nerob oba recepty na tej istej bielkovine. Ak sú navyše všetky už navrhnuté jedlá (zoznam nižšie)
  mäsové, aspoň jeden z tvojich dvoch receptov nech je bezmäsitý — celý týždenný výber
  nemá byť šesťkrát mäso.
- Jedlá musia byť postavené HLAVNE na akciových produktoch vyššie.
- Kvôli pestrosti UPREDNOSTNI nové akcie v tejto fáze; staršie akcie môžeš použiť ako doplnok.
- Varíme pre 2 osoby. Rešpektuj veľkosti balení (napr. neber 50 g z balenia 400 g).

PRAVIDLÁ PRE SUROVINY:
- Každá surovina má "source": "sale" (z akcie vyššie), "pantry" (domáca špajza) alebo "buy" (treba dokúpiť, nie je v akcii).
- Pri surovinách "sale" uveď "productId" (id zo zoznamu vyššie) a "packFraction" = koľko predávaných balení/kusov
  sa použije (0.5 = pol balenia, 1 = celé balenie, 2 = dve balenia/kusy).
- Ignoruj nápoje, hotové zmrzliny a dezerty a nepotravinový tovar.
- Alkohol použi LEN ak je lacný a kulinársky opodstatnený (napr. víno do marinády), NIKDY nie ako nápoj.
  Nikdy nevyžaduj kúpu celej drahej fľaše liehoviny (vodka, rum, whisky...) kvôli pár mililitrom — ak by to bol
  jediný dôvod na nákup, danú surovinu radšej vynechaj.
- Soľ a čierne korenie MUSIA byť uvedené medzi surovinami (source "pantry"), ak sa použijú v krokoch.
- Ako "pantry" smieš označiť VÝHRADNE suroviny z tohto zoznamu: ${pantry}.
  Čokoľvek iné (cibuľa, cesnak, múka, koreniny, cestoviny, ryža, smotana...) je "buy" — aj keď to
  považuješ za bežnú surovinu. Zákazník musí vidieť, čo si má kúpiť.

PRAVIDLÁ PRE KROKY (píšeš NÁVOD pre začiatočníka, nie inšpiráciu):
- KAŽDÁ surovina zo zoznamu sa musí objaviť aspoň v jednom kroku AJ S PRESNÝM MNOŽSTVOM
  (napr. "pridáme 300 g nakrájaných marhúľ", nikdy len "pridáme marhule").
- ZAKÁZANÉ sú AKÉKOĽVEK nečíselné množstvá: "trochou", "podľa potreby", "štipka", "za hrsť",
  "kúsok", "podľa chuti" a im podobné. KAŽDÉ množstvo v kroku musí mať číslo a jednotku
  ("100 ml vody", "0.5 ČL soli"). Pri soli/korení môžeš doplniť "(dochutíme)" ZA číslom, nie namiesto neho.
  Platí to aj pre vodu na varenie ryže/cestovín — aj tam sa soľ uvádza číslom.
- Každý krok s tepelnou úpravou uvádza ČAS a teplotu/intenzitu ohňa a vizuálny znak hotovosti
  (napr. "opekáme 4 – 5 minút na strednom ohni, kým nevznikne zlatá kôrka").
- Ak sa pečie v rúre: predhriatie rúry na konkrétnu teplotu je SAMOSTATNÝ prvý krok.
- Pri krájaní uveď veľkosť kúskov (napr. "na kocky 2 cm", "na plátky hrubé 1 cm").
- Ak sa na horúcu panvicu pridáva alkohol, krok musí obsahovať bezpečné poradie
  (odstavíme z ohňa → prilejeme → vrátime na oheň).
- Kroky zoraď tak, aby VŠETKY zložky jedla boli hotové naraz — prílohu (cestoviny, ryžu...)
  var súbežne s hlavným jedlom, nikdy nie ako prvý krok s následným čakaním.
- Súčet množstiev suroviny použitých naprieč krokmi sa musí presne rovnať množstvu v zozname surovín.
- Jednotky používaj VÝHRADNE: g, ml, ks, PL (polievková lyžica), ČL (čajová lyžička) — v celom recepte rovnako.
- Teplotu píš vždy v tvare "200 °C", nikdy slovami ("200 stupňov Celzia").
- Nikdy neuvádzaj množstvo slovom "polovicu"/"zvyšok" bez čísla — vždy konkrétne ("0.5 PL oleja").
  (Výnimka: "rozkrojíme na polovicu" ako spôsob krájania je v poriadku.)
- Ak sa v kroku varí v tekutine (cestoviny, ryža), voda MUSÍ byť aj v zozname surovín so source "pantry".
- Všetky kroky píš v 1. osobe množného čísla ("umyjeme", "opečieme"), nikdy v rozkazovacom spôsobe.
- Názov, popis aj spôsob prípravy v krokoch (panvica/rúra/gril) sa musia navzájom zhodovať.
- Sušené ovocie, orechy a iné chrumkavé ozdoby pridávaj AŽ PO tepelnej úprave (inak zhoria a stvrdnú).

PRAVOPIS (dôležité — nepleť si tieto dve miesta):
- Pole "name" v zozname surovín: veľké začiatočné písmeno ("Soľ", "Rastlinný olej", "Kuracie prsné rezne").
- Text v krokoch: normálna slovenčina. KAŽDÝ krok je veta — začína VEĽKÝM písmenom a končí bodkou
  ("Predhrejeme rúru na 200 °C."), nikdy nie malým písmenom.
  Ale VNÚTRI vety píš všeobecné podstatné mená malým písmenom a skloňuj ich
  ("zmiešame s 2 PL rastlinného oleja, 1 ČL soli a 0.5 ČL čierneho korenia").
  Veľké písmeno vnútri vety patrí IBA značkám a vlastným menám (ALESTO, Halloumi, Karička, Mozzarella).
  NIKDY nepíš v krokoch "1 ČL Soli" ani "2 PL Rastlinného oleja" — pôsobí to ako výpis z databázy.

POCTIVOSŤ NÁZVU A POPISU (rovnaké pravidlo pre "title" AJ "description"):
- Ani názov, ani popis nesmú spomínať suroviny, časti mäsa, techniky či zložky, ktoré v recepte NIE SÚ:
  * žiadne „karé", keď sú v surovinách stehná;
  * žiadne „ragú", keď jedlo nemá žiadnu tekutinu/omáčku;
  * žiadna „zálievka"/„dresing", ak recept neobsahuje samostatnú zálievku;
  * žiadne „grilované", ak sa pečie v rúre;
  * názov suroviny v popise musí sedieť so zoznamom (nie „cherry paradajky", keď sú v zozname „Koktejlové paradajky");
  * nepridávaj vlastnosti, ktoré v názve produktu nie sú (napr. „biele víno", keď je v zozname len „Suché talianske víno");
  * nezľahčuj množstvo („kvapkou vína", keď recept používa 100 ml).
- Nepoužívaj tautológiu (napr. „ragú na hubách s kuriatkami" — kuriatka SÚ huby).

ČAS A NÁROČNOSŤ:
- "estimatedTime" = CELKOVÝ čas od začiatku po servírovanie, VRÁTANE predhriatia rúry.
- "activeTime" = iba čas, keď človek reálne pracuje (krájanie, opekanie, miešanie).
  Pasívne čakanie (pečenie v rúre, dusenie pod pokrievkou, predhriatie) sa do neho NEPOČÍTA.
  Príklad: bôčik 90 minút v rúre = estimatedTime „90 minút", activeTime „15 minút".
- "difficulty" hodnotí VÝHRADNE náročnosť techniky, NIKDY nie dĺžku prípravy:
  * "easy" = základné úkony (nakrájať, opiecť, upiecť na plechu), aj keď to trvá 90 minút;
  * "medium" = viac procesov naraz, načasovanie, práca s omáčkou/redukciou alebo citlivá surovina.

REALISTICKOSŤ:
- Množstvo mäsa/hlavnej bielkoviny pre 2 osoby: 300 – 600 g. Ak je v jedle aj príloha (ryža, cestoviny)
  a druhá bielkovina (syr), drž sa spodnej hranice — jedlo nemá byť neúmerne ťažké.
- Časy tepelnej úpravy musia zodpovedať surovine (napr. celé kuracie štvrte v rúre pri 200 °C ≈ 50 – 60 minút;
  cherry paradajky pridaj až na posledných 10 – 15 minút pečenia, inak sa rozvaria).
- CHUDÉ mäso (bravčové karé, kuracie prsia, panenka) sa rýchlo vysuší: na panvici max 3 – 4 minúty
  z každej strany. Dlhé opekanie chudého mäsa je chyba.
- Zelenina, ktorá pri dlhom pečení vysychá (kukurica, koreňová zelenina, zemiaky), sa NESMIE piecť
  dlho nasucho v otvorenom pekáči. Buď ju zabaľ do alobalu s trochou vody/oleja, alebo ju predvar,
  alebo ju pridaj až na posledných 20 – 30 minút. Každá zložka na plechu musí dostať aj tuk/tekutinu.
- Cestoviny a ryža NESMÚ ostať suché. Jedlo s cestovinami musí mať niečo, čo ich spojí — omáčku
  (napr. z paradajok), alebo aspoň tuk a chuťový základ. Samotné scedené cestoviny so soľou
  a kúskom syra nie sú hotové jedlo. Ak je v jedle príloha, časť tuku nechaj práve na ňu.
- Syr ako hlavná zložka jedla: max 250 g pre 2 osoby (vyprážaný/grilovaný syr je ťažký a slaný).
  Väčšie množstvo použi len ak je syr doplnok, nie základ.

FORMÁT ODPOVEDE:
- Odpovedaj PO SLOVENSKY.
- Vráť striktne JSON podľa poskytnutej schémy, bez textu navyše.
- "category" musí byť jedna z: meat, pasta, soup, salad, baked, dessert.
  Vyber ju podľa PORADIA PRIORITY (prvá pravidlo, ktoré sedí, vyhráva) — nemiešaj hľadiská:
    1. "dessert" — sladké jedlo / dezert;
    2. "soup" — jedlo, ktoré sa je lyžicou a je prevažne tekuté;
    3. "salad" — studené jedlo servírované ako šalát;
    4. "pasta" — cestoviny, ryža alebo iná obilnina tvorí základ jedla;
    5. "meat" — mäso alebo ryba je hlavná zložka (BEZ OHĽADU na to, či sa pečie v rúre alebo na panvici);
    6. "baked" — až zvyšné zapekané jedlá bez dominantného mäsa (napr. zeleninové/syrové zapekané).
  Pozor: kuracie prsia zapečené v rúre sú VŽDY "meat", nikdy "baked" — rozhoduje hlavná zložka, nie technika.
- "difficulty" musí byť "easy" alebo "medium".
- "steps" je pole krokov, kde jeden krok = jeden prvok poľa.`;
};
