/**
 * Step 0 — find the flyer that is current for a given day and snapshot it.
 *
 * Run standalone: npm run catalog:fetch [-- --date=YYYY-MM-DD]
 */

import fs from 'fs';
import path from 'path';
import {
  addDays,
  buildSlug,
  fetchFlyerByIdentifier,
  mondayOf,
  parseIsoDate,
  todayInBratislava,
  type Flyer,
} from './flyer-api';

const SNAPSHOT_DIR = path.join(__dirname, '..', '..', 'data', 'flyers');

/**
 * Day offsets from Monday to try, in order.
 *
 * Lidl's flyer week normally starts on Monday, but public holidays (Easter,
 * Christmas, a Monday holiday) shift it. Rather than encode the Slovak holiday
 * calendar — which is its own maintenance burden and still wouldn't cover
 * Lidl's discretion — we probe outward from Monday and let the API's own
 * `offerStartDate`/`offerEndDate` decide which candidate is real.
 *
 * TODO: this is a brute-force stand-in. If it ever picks the wrong week,
 * revisit — either a small hardcoded SK holiday list, or persisting observed
 * `offerStartDate`s and extrapolating the cadence.
 */
const DAY_OFFSETS = [0, -1, 1, -2, 2, -3, 3];

/** How far ahead a not-yet-started flyer may be and still be accepted. */
const UPCOMING_WINDOW_DAYS = 7;

/**
 * Picks the flyer to use for `targetDate`.
 *
 * Prefers a flyer whose offer window contains the target day. Falls back to one
 * that starts within the next week, because Lidl publishes ~3 days early — that
 * is what lets the pipeline run on Sunday and have Monday's recipes ready.
 */
const isUsableFor = (flyer: Flyer, targetDate: Date): 'current' | 'upcoming' | null => {
  const start = parseIsoDate(flyer.offerStartDate);
  const end = parseIsoDate(flyer.offerEndDate);

  if (start <= targetDate && targetDate <= end) return 'current';
  if (targetDate < start && start <= addDays(targetDate, UPCOMING_WINDOW_DAYS)) return 'upcoming';
  return null;
};

/**
 * Resolves and returns the flyer for `targetDate` (default: today in Bratislava).
 *
 * Probes Monday-anchored slugs, collecting candidates rather than taking the
 * first hit: a slug can resolve to a flyer whose window doesn't cover the target
 * day, and a currently-valid flyer must win over a merely upcoming one.
 */
export const resolveFlyer = async (targetDate = todayInBratislava()): Promise<Flyer> => {
  const monday = mondayOf(targetDate);
  const tried: string[] = [];
  let upcoming: Flyer | null = null;

  for (const offset of DAY_OFFSETS) {
    const slug = buildSlug(addDays(monday, offset));
    tried.push(slug);

    const flyer = await fetchFlyerByIdentifier(slug);
    if (!flyer) continue;

    const usability = isUsableFor(flyer, targetDate);
    if (usability === 'current') return flyer;
    if (usability === 'upcoming' && !upcoming) upcoming = flyer;
  }

  if (upcoming) return upcoming;

  throw new Error(
    `No flyer found covering ${targetDate.toISOString().slice(0, 10)}. Tried:\n  ${tried.join('\n  ')}`,
  );
};

/** Writes the flyer snapshot to disk and returns its path. */
const saveSnapshot = (flyer: Flyer): string => {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  const file = path.join(SNAPSHOT_DIR, `${flyer.identifier}.json`);
  fs.writeFileSync(file, JSON.stringify(flyer, null, 2));
  return file;
};

/** Reads a previously saved snapshot, or `null` if it isn't there. */
export const readSnapshot = (identifier: string): Flyer | null => {
  const file = path.join(SNAPSHOT_DIR, `${identifier}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as Flyer;
};

/** Returns the most recently saved snapshot, or `null` when there are none. */
export const readLatestSnapshot = (): Flyer | null => {
  if (!fs.existsSync(SNAPSHOT_DIR)) return null;

  const snapshots = fs
    .readdirSync(SNAPSHOT_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => ({ name, mtime: fs.statSync(path.join(SNAPSHOT_DIR, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (snapshots.length === 0) return null;
  return JSON.parse(fs.readFileSync(path.join(SNAPSHOT_DIR, snapshots[0].name), 'utf-8')) as Flyer;
};

/**
 * Step 0 entry point: resolve the current flyer and snapshot it to disk.
 *
 * The snapshot exists so later steps (and repeated manual runs while iterating
 * on them) don't re-hit the API.
 */
export const fetchFlyer = async (targetDate?: Date): Promise<Flyer> => {
  const flyer = await resolveFlyer(targetDate);
  const file = saveSnapshot(flyer);

  console.log(
    `📄 Flyer "${flyer.identifier}": ${flyer.pages.length} pages, valid ${flyer.offerStartDate} → ${flyer.offerEndDate}`,
  );
  console.log(`   Snapshot: ${path.relative(process.cwd(), file)}`);

  return flyer;
};

/** Reads an optional `--date=YYYY-MM-DD` override from argv. */
const parseDateArg = (): Date | undefined => {
  const arg = process.argv.find((value) => value.startsWith('--date='));
  return arg ? parseIsoDate(arg.slice('--date='.length)) : undefined;
};

if (require.main === module) {
  fetchFlyer(parseDateArg()).catch((error) => {
    console.error('❌ Failed to fetch the flyer:', error);
    process.exit(1);
  });
}
