/**
 * Site-wide identity used by metadata, the sitemap, structured data and OG images.
 *
 * `NEXT_PUBLIC_SITE_URL` lets a custom domain replace the Vercel one without a
 * code change — every canonical URL, sitemap entry and JSON-LD link derives
 * from `SITE_URL`.
 */
const DEFAULT_SITE_URL = 'https://my-cheap-chef.vercel.app';

/** Absolute origin of the production site, without a trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

export const SITE_NAME = 'My Cheap Chef';

export const SITE_TAGLINE = 'Recepty z akciového letáku Lidl';

export const SITE_DESCRIPTION =
  'Zistite, čo uvariť z potravín, ktoré sú práve v akcii v Lidli. Každý týždeň nové recepty z aktuálneho letáku — s cenou, úsporou a presným postupom.';

/**
 * Open Graph fields shared by every page.
 *
 * A page that sets its own `openGraph` replaces the layout's object wholesale
 * (Next.js merges metadata shallowly), so pages spread this in rather than
 * silently losing the site name and locale. Title and description are left out
 * on purpose — Next.js fills them from the page's own `title` / `description`.
 */
export const BASE_OPEN_GRAPH = {
  type: 'website',
  siteName: SITE_NAME,
  locale: 'sk_SK',
  // The default preview image (src/app/opengraph-image.tsx). It has to be named
  // here: a page's own `openGraph` object also drops the image the root segment
  // would otherwise hand down. It also beats a route's own opengraph-image
  // file, so such a route (the recipe page) must set `images` itself.
  images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
};

/** Builds an absolute URL from a site path (`/recipes` → `https://…/recipes`). */
export const absoluteUrl = (path = '/'): string => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
