/**
 * Builds the Slovak "culinary editor" prompt for the second AI pass.
 *
 * The generator writes recipes; this pass reviews them for culinary logic that
 * rule lists can't cover (cooking order, realistic times for a given cut,
 * ingredients that release water, dish-name honesty) and returns a fixed JSON
 * in the same schema. Money-related fields (productId, packFraction, source)
 * must stay untouched — they are recomputed and linked to the product DB.
 */

/**
 * Wraps the draft recipes JSON in a review checklist prompt.
 */
export const buildEditorPrompt = (recipesJson: string): string => {
  return `Si prísny redaktor kuchárskej knihy a skúsený kuchár. Dostaneš JSON s 2 receptami.
Skontroluj ich KULINÁRSKU LOGIKU a vráť OPRAVENÝ JSON v tej istej schéme.

NA ČO SA ZAMERAJ:

1. PORADIE A ČASOVANIE KROKOV:
- Všetky zložky jedla musia byť hotové naraz. Prílohu (cestoviny, ryžu, zemiaky) var SÚBEŽNE
  s hlavným jedlom — nikdy nie ako prvý krok, po ktorom by 15 minút stála a zlepila sa.
- Časy a teploty musia byť realistické pre danú surovinu a hrúbku kúskov
  (kuracie prsia sa dlhým pečením vysušia; surová kukurica sa v suchej rúre neupečie —
  treba ju predvariť alebo zabaliť do alobalu; celé kusy mäsa potrebujú viac času než kocky).
- Suroviny, ktoré púšťajú veľa vody (paradajky, huby, cuketa), musia mať kroky, ktoré s tým
  počítajú (odparenie, pridanie neskôr, scedenie) — inak sa jedlo namiesto pečenia varí.
- Ak sa v rúre pečie viac zložiek naraz, časy vkladania uvádzaj absolútne
  („po 40 minútach pridáme..."), nie „na posledných X minút".

2. POCTIVOSŤ NÁZVU A POPISU (kontroluj "title" AJ "description" rovnako prísne):
- Nesmú tvrdiť nič, čo v recepte nie je: iný kus mäsa (napr. „karé" pri stehnách),
  iná technika (napr. „grilované", keď sa pečie v rúre), názov jedla, ktorému chýba podstata
  (napr. „ragú" bez tekutiny), ani zložka, ktorá v recepte nie je (napr. „s jemnou zálievkou",
  keď žiadna zálievka neexistuje).
- Názvy surovín v popise musia sedieť so zoznamom surovín (nie „cherry paradajky", keď sú
  v zozname „Koktejlové paradajky kríčkové").
- Odstráň tautológie (napr. „ragú na hubách s kuriatkami" — kuriatka sú huby).

3. MNOŽSTVÁ (kontroluj OBOMA smermi):
- Súčet množstiev suroviny naprieč krokmi sa musí presne rovnať množstvu v zozname surovín —
  nesmie byť ani VIAC (napr. zoznam 1 ČL soli, ale kroky použijú 1 ČL + 1 ČL),
  ani MENEJ (napr. zoznam 100 ml vody, ale krok použije len 50 ml).
  Oprav buď zoznam, alebo kroky, nech to sedí.
- Každá surovina zo zoznamu sa objaví aspoň v jednom kroku s číselným množstvom.
  Pozor na soľ a korenie — často sa v kroku spomenú bez čísla ("osolíme a okoreníme"), to oprav.
- Ak recept surovinu reálne nepotrebuje, vyhoď ju zo zoznamu; ak krok potrebuje surovinu
  navyše (napr. vodu/tekutinu do omáčky), pridaj ju do zoznamu so source "buy"
  (ako "pantry" smie byť označené len: soľ, čierne korenie, cukor, rastlinný olej, voda, vajcia).

4. ČAS A NÁROČNOSŤ:
- "estimatedTime" = celkový čas vrátane predhriatia rúry. Ak recept predhrieva rúru, čas to musí zahŕňať.
- "activeTime" = len čas aktívnej práce, bez pasívneho čakania (rúra, dusenie, predhriatie).
- "difficulty" hodnotí IBA náročnosť techniky, nikdy nie dĺžku prípravy — jedlo, ktoré sa 90 minút
  samo pečie v rúre, je "easy", ak sú úkony jednoduché.

5. PORADIE CHRUMKAVÝCH PRÍSAD:
- Sušené ovocie, orechy a semienka nesmú ísť do rúry na dlhé pečenie (zhoria, stvrdnú) —
  presuň ich do kroku po tepelnej úprave.

6. VYSYCHAJÚCE SUROVINY A CHUDÉ MÄSO:
- Kukurica, koreňová zelenina a zemiaky sa nesmú dlho piecť nasucho v otvorenom pekáči —
  zabaľ ich do alobalu s vodou/olejom, predvar ich, alebo ich pridaj až na posledných 20 – 30 minút.
- Každá zložka na plechu musí dostať tuk alebo tekutinu, nielen mäso.
- Chudé mäso (bravčové karé, kuracie prsia, panenka) na panvici max 3 – 4 minúty z každej strany —
  dlhšie opekanie ho vysuší. Oprav prehnané časy.

7. PRAVOPIS V KROKOCH:
- V texte krokov píš všeobecné podstatné mená malým písmenom a skloňuj ich
  ("2 PL rastlinného oleja", nie "2 PL Rastlinného oleja"). Veľké písmeno nechaj len značkám
  a vlastným menám (ALESTO, Halloumi, Karička). Pole "name" v zozname surovín ostáva s veľkým písmenom.

8. ŽIADNE NEČÍSELNÉ MNOŽSTVÁ:
- Odstráň "štipka", "trochou", "za hrsť", "podľa potreby" a nahraď ich číslom s jednotkou —
  vrátane soli do vody na ryžu/cestoviny. Nezabudni, že takto pridaná soľ sa počíta do celkového
  množstva soli v zozname surovín.

ČO NESMIEŠ MENIŤ:
- Štruktúru JSON, počet receptov (2), jazyk (slovenčina) ani celkový koncept jedál
  (nemeň jedlo na iné jedlo — len opravuj chyby).
- Polia "productId", "packFraction" a "source" pri existujúcich surovinách — sú previazané
  na databázu produktov. Výnimka: packFraction môžeš opraviť, ak nesedí s množstvom v recepte.

Ak je recept v poriadku, vráť ho nezmenený. Vráť IBA JSON podľa schémy, žiadny text navyše.

RECEPTY NA KONTROLU:
${recipesJson}`;
};
