/**
 * Slovak wall-clock time, independent of the host's timezone.
 *
 * Everything the app decides from "what day is it" — which promo basket is
 * live, the greeting, whether a discount has run out — is anchored to Slovak
 * local time. `Date.getDay()` / `getHours()` read the host's timezone instead,
 * which is UTC on Vercel and GitHub Actions: baskets would unlock an hour or
 * two after midnight and the greeting would lag behind the visitor's clock.
 */

const TIME_ZONE = 'Europe/Bratislava';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  hour: '2-digit',
  hourCycle: 'h23',
});

// `en-CA` prints ISO order (YYYY-MM-DD), which makes the keys sortable as strings.
const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const WEEKDAY_TO_DAY_NUMBER: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const getPart = (date: Date, type: Intl.DateTimeFormatPartTypes): string =>
  partsFormatter.formatToParts(date).find((part) => part.type === type)?.value ?? '';

/** Day of the week in Bratislava, as `Date.getDay()` numbers it (0 = Sunday). */
export const getBratislavaDay = (date: Date): number => WEEKDAY_TO_DAY_NUMBER[getPart(date, 'weekday')] ?? 0;

/** Hour of the day in Bratislava, 0–23. */
export const getBratislavaHour = (date: Date): number => Number(getPart(date, 'hour')) % 24;

/**
 * The Slovak calendar day as `YYYY-MM-DD`.
 *
 * Keys compare correctly as plain strings, so "has this offer run out" is
 * `todayKey > lastValidDayKey` with no timestamp arithmetic. Works for both
 * kinds of validity stamps we store: flyer dates (UTC midnight of the Slovak
 * day) and live-API instants.
 */
export const getBratislavaDateKey = (date: Date): string => dateKeyFormatter.format(date);

/** Same as `getBratislavaDateKey`, for the epoch-seconds stamps products carry. */
export const getBratislavaDateKeyFromEpoch = (epochSeconds: number): string =>
  getBratislavaDateKey(new Date(epochSeconds * 1000));
