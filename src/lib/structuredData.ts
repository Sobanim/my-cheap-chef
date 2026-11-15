import { localizeDecimals } from '@/lib/format';
import { getCategoryLabel } from '@/lib/recipeLabels';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import type { Recipe } from '@/lib/types/recipe';

/**
 * schema.org structured data (JSON-LD).
 *
 * This is the machine-readable twin of a page: search engines use it for rich
 * results (a recipe card with time and ingredients instead of a plain blue
 * link), and AI assistants use it to quote the site accurately. It must only
 * restate what the page visibly shows.
 */

export type JsonLdObject = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Who publishes the site. Referenced by id from every other object. */
export const buildOrganizationJsonLd = (): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/icon-512.png'),
});

export const buildWebSiteJsonLd = (): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  alternateName: 'Varím zo zliav',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: 'sk-SK',
  publisher: { '@id': ORGANIZATION_ID },
});

/**
 * `"65 minút"` → `"PT65M"` (ISO 8601 duration), or `undefined` when the text
 * holds no number — better to omit the field than to publish a wrong time.
 */
export const toIsoDuration = (text: string): string | undefined => {
  const hours = Number(text.match(/(\d+)\s*(?:h|hod)/i)?.[1] ?? 0);
  const minutes = Number(text.match(/(\d+)\s*min/i)?.[1] ?? 0);
  const totalMinutes = hours * 60 + minutes;

  return totalMinutes > 0 ? `PT${totalMinutes}M` : undefined;
};

/** The recipe page as a schema.org `Recipe`. */
export const buildRecipeJsonLd = (recipe: Recipe, generatedAt: string): JsonLdObject => {
  const url = absoluteUrl(`/recipe/${recipe.id}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    url,
    mainEntityOfPage: url,
    image: [`${url}/opengraph-image`],
    inLanguage: 'sk-SK',
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...(generatedAt ? { datePublished: generatedAt } : {}),
    recipeCategory: getCategoryLabel(recipe.category, recipe.cookingMethod),
    recipeCuisine: 'Slovenská',
    recipeYield: `${recipe.servings} porcie`,
    totalTime: toIsoDuration(recipe.estimatedTime),
    prepTime: toIsoDuration(recipe.activeTime),
    keywords: 'lacný recept, recept z akcie, Lidl leták, varenie zo zliav',
    recipeIngredient: recipe.ingredients.map((ingredient) => `${localizeDecimals(ingredient.amount)} ${ingredient.name}`),
    recipeInstructions: recipe.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: localizeDecimals(step),
    })),
  };
};

export type FaqItem = {
  question: string;
  answer: string;
};

/** A question-and-answer block as schema.org `FAQPage`. */
export const buildFaqJsonLd = (items: readonly FaqItem[]): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});

type Breadcrumb = { name: string; path: string };

export const buildBreadcrumbJsonLd = (crumbs: readonly Breadcrumb[]): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});
