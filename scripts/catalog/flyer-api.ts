/**
 * Access to Lidl's flyer API (Schwarz "leaflets" platform).
 *
 * Isolated from the pipeline step so that `fetch-flyer.ts` reads as "find this
 * week's flyer and save it", while the URL shapes, slug format and calendar
 * arithmetic — the parts that break when Lidl changes something — live here.
 */

const API_BASE = 'https://endpoints.leaflets.schwarz/v4/flyer';

/** One page of the flyer. Only the fields the pipeline actually consumes. */
export type FlyerPage = {
  number: number;
  /** One-sentence Slovak description of the page. Present on every page, drives Step 1. */
  altText: string;
  /** OCR dump of the page. Noisy — used only as a weak hint, never as a source of truth. */
  keyWords: string;
  /** 2400px page image. HMAC-signed: use verbatim, never rebuild or edit. */
  zoom: string;
};

/** The flyer document, trimmed to what the pipeline needs. */
export type Flyer = {
  /** The identifier we resolved it by — used as the snapshot filename. */
  identifier: string;
  /** First day the offers are valid (YYYY-MM-DD). */
  offerStartDate: string;
  /** Last day the offers are valid (YYYY-MM-DD). */
  offerEndDate: string;
  pages: FlyerPage[];
};

/**
 * A civil date in Bratislava, as a UTC-midnight `Date`.
 *
 * Everything here is calendar arithmetic on Slovak local dates: which Monday a
 * flyer starts, whether its window covers today. Doing that on real timestamps
 * would let the CI runner's timezone (UTC) shift a date across midnight, the
 * same trap `src/lib/baskets.ts` documents for weekday math. Pinning to UTC
 * midnight makes day arithmetic exact and DST-proof.
 */
const bratislavaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Bratislava',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Parses a YYYY-MM-DD string into a UTC-midnight Date. */
export const parseIsoDate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/** Today's date as it is in Bratislava right now. */
export const todayInBratislava = (): Date => parseIsoDate(bratislavaDateFormatter.format(new Date()));

/** Adds (or subtracts) whole days. */
export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

/** The Monday of the week containing `date` (weeks start Monday). */
export const mondayOf = (date: Date): Date => {
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return addDays(date, -daysSinceMonday);
};

/**
 * Builds the flyer slug for a given start date: `online-letak-platny-od-DD-MM-YYYY`.
 */
export const buildSlug = (date: Date): string => {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `online-letak-platny-od-${day}-${month}-${date.getUTCFullYear()}`;
};

/**
 * Fetches a flyer by slug (or uuid — the endpoint accepts both).
 * Returns `null` when the flyer does not exist, so the caller can keep probing.
 */
export const fetchFlyerByIdentifier = async (identifier: string): Promise<Flyer | null> => {
  const response = await fetch(`${API_BASE}?flyer_identifier=${encodeURIComponent(identifier)}`);

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Flyer API responded with status ${response.status} for "${identifier}".`);
  }

  const payload = (await response.json()) as { flyer?: RawFlyer };
  const flyer = payload.flyer;

  // A 200 with no flyer body means "no such flyer" just as much as a 404 does.
  if (!flyer?.pages?.length) return null;

  return {
    identifier,
    offerStartDate: flyer.offerStartDate,
    offerEndDate: flyer.offerEndDate,
    pages: flyer.pages.map((page) => ({
      number: page.number,
      altText: page.altText ?? '',
      keyWords: page.keyWords ?? '',
      zoom: page.zoom,
    })),
  };
};

/** The raw API shape, narrowed to the fields we read. */
type RawFlyer = {
  offerStartDate: string;
  offerEndDate: string;
  pages: Array<{
    number: number;
    altText?: string;
    keyWords?: string;
    zoom: string;
  }>;
};
