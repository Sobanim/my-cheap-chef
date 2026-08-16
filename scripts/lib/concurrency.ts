/**
 * Minimal concurrency helper.
 *
 * The catalog pipeline sends one Gemini call per flyer page (~49 pages). Firing
 * all of them at once invites rate limits; doing them serially takes ~9 minutes
 * at ~11 s per page. A small worker pool is the whole requirement — not enough
 * to justify pulling in p-limit as a dependency.
 */

/**
 * Maps over `items` with at most `limit` calls to `worker` in flight at once.
 *
 * Results keep the input order regardless of completion order, so callers can
 * zip them back against the original list. Rejections propagate: a worker that
 * needs to tolerate failure should catch inside and return a result value
 * (which is what the page parser does, so one bad page can't lose the batch).
 */
export const mapWithLimit = async <T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let next = 0;

  const runner = async (): Promise<void> => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));

  return results;
};
