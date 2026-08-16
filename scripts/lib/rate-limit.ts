/**
 * A global rate limiter for Gemini calls.
 *
 * The free tier allows 15 requests per minute per model. Capping *concurrency*
 * doesn't respect that: 5 calls in flight at ~11 s each is ~27 requests a
 * minute, which is how the first full pipeline run got 429-ed on 36 of 51 pages.
 * What has to be limited is the rate, not the parallelism — so calls stay
 * concurrent (that's what keeps the run to minutes) but are paced through here.
 */

/** Requests per minute. Below the free tier's 15, leaving room for retries. */
const REQUESTS_PER_MINUTE = 12;

const WINDOW_MS = 60_000;

/** Timestamps of calls made inside the current rolling window. */
const recent: number[] = [];

/**
 * Serializes slot acquisition.
 *
 * Without this, concurrent callers all read `recent` before any of them writes
 * to it and every one of them concludes there is room — the exact race the
 * limiter exists to prevent. Only the *acquisition* is serialized; the API calls
 * themselves still overlap.
 */
let gate: Promise<void> = Promise.resolve();

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const takeSlot = async (): Promise<void> => {
  for (;;) {
    const now = Date.now();
    while (recent.length > 0 && now - recent[0] >= WINDOW_MS) recent.shift();

    if (recent.length < REQUESTS_PER_MINUTE) {
      recent.push(now);
      return;
    }

    // Wait until the oldest call falls out of the window, plus a little slack.
    await sleep(WINDOW_MS - (now - recent[0]) + 100);
  }
};

/** Waits until it is this caller's turn to make a request. */
export const acquireRateLimitSlot = (): Promise<void> => {
  const turn = gate.then(takeSlot);
  // Keep the chain alive even if a caller's turn rejects, or every later call
  // would inherit that rejection and the pipeline would stall.
  gate = turn.then(
    () => undefined,
    () => undefined,
  );
  return turn;
};
