import { loadCatalogData } from "@/lib/catalogData";
import { formatEuro } from "@/lib/format";
import { loadRecipeData } from "@/lib/recipeData";
import { isRecipeAvailable } from "@/lib/recipeAvailability";
import { getRecipeMoney } from "@/lib/recipeMoney";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

/**
 * /llms.txt — a plain-language summary of the site for AI assistants.
 *
 * The emerging convention (llmstxt.org) for telling a language model what a
 * site is and which pages matter, so it can describe and link to it correctly.
 * Generated rather than static so the recipe list is always this week's.
 */
export const GET = async (): Promise<Response> => {
  const now = new Date();
  const [{ recipes }, catalog] = await Promise.all([loadRecipeData(), loadCatalogData()]);
  const available = recipes.filter((recipe) => isRecipeAvailable(recipe, now));

  const recipeLines = available.map((recipe) => {
    const { cost } = getRecipeMoney(recipe);
    return `- [${recipe.title}](${absoluteUrl(`/recipe/${recipe.id}`)}): ${recipe.description} ${recipe.estimatedTime}, ${formatEuro(cost)} za ${recipe.servings} porcie.`;
  });

  const body = [
    `# ${SITE_NAME} (Varím zo zliav)`,
    "",
    "> Bezplatná slovenská webová aplikácia, ktorá každý týždeň zostaví recepty z potravín v akcii v aktuálnom letáku Lidl Slovensko. Pri každom recepte uvádza cenu akciových surovín, úsporu oproti bežnej cene a presný postup.",
    "",
    "Ako to funguje:",
    "- Každý pondelok sa spracuje nový akciový leták Lidl Slovensko a vyberú sa z neho potraviny v akcii.",
    "- Z týchto potravín vznikne 12 receptov na týždeň, každý pre 2 porcie.",
    "- Recepty sa odomykajú podľa toho, kedy zľavy začínajú platiť: v pondelok, vo štvrtok a v sobotu.",
    "- Ceny a úspora sa počítajú z cien vytlačených v letáku. Úspora sa uvádza len tam, kde leták uvádza aj pôvodnú cenu.",
    "- Aplikácia je zadarmo, bez registrácie. Je to nezávislý projekt, nie oficiálna služba spoločnosti Lidl.",
    "",
    "## Stránky",
    "",
    `- [Recepty tohto týždňa](${absoluteUrl("/recipes")}): všetky recepty z aktuálneho letáku.`,
    `- [Akcie z letáku](${absoluteUrl("/catalog")}): prehľad potravín v akcii${catalog.products.length > 0 ? ` (${catalog.products.length} produktov, platnosť ${catalog.offerStartDate} až ${catalog.offerEndDate})` : ""}.`,
    `- [O aplikácii](${absoluteUrl("/o-aplikacii")}): čo aplikácia robí, ako funguje a časté otázky.`,
    "",
    "## Aktuálne recepty",
    "",
    ...(recipeLines.length > 0 ? recipeLines : ["- Nové recepty sa práve pripravujú."]),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
