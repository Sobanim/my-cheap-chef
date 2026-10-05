/**
 * Thin wrapper around the Gemini API for JSON generation.
 * Used by the offline pipeline scripts (not by the web app).
 */

import { GoogleGenAI, type Schema } from '@google/genai';
import { acquireRateLimitSlot } from './rate-limit';

const MODEL = 'gemini-3.1-flash-lite';

/** Attempts per call when the API answers "rate limited". */
const MAX_RATE_LIMIT_RETRIES = 3;

/**
 * Waits before each retry of an overloaded-server error (503 "high demand").
 * These spikes usually clear within minutes, so the backoff stretches out —
 * a weekly cron can afford to wait, it can't afford to fail.
 */
const OVERLOAD_BACKOFF_MS = [15_000, 30_000, 60_000];

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reads the wait the API asked for, in ms.
 *
 * A 429 carries a `retryDelay` ("45s"); honouring it is the difference between
 * backing off and hammering a closed door. Falls back to a minute — the length
 * of the quota window — when the field isn't there.
 */
const retryDelayFrom = (error: unknown): number => {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  return match ? Math.ceil(Number(match[1]) * 1000) + 500 : 60_000;
};

const statusOf = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null ? (error as { status?: number }).status : undefined;

const isRateLimited = (error: unknown): boolean => statusOf(error) === 429;

/** Server-side hiccups (overload, internal error, timeout) that are worth retrying. */
const isTransient = (error: unknown): boolean => [500, 503, 504].includes(statusOf(error) ?? 0);

/**
 * An image to send alongside the prompt.
 *
 * It has to be raw bytes: Gemini's `fileData.fileUri` only accepts Google-hosted
 * URIs, so a public flyer image URL cannot be passed through — we download the
 * page ourselves and inline it as base64. A 2400px flyer page is ~450 KB, which
 * costs ~1075 image tokens and stays far below the inline request limit.
 */
export type ImageInput = {
  data: Buffer;
  mimeType: string;
};

/**
 * Creates a Gemini client. Reads the API key from GEMINI_API_KEY
 * (local: .env file, CI: repository secret).
 */
const createClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env file (see .env.example).');
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Sends a prompt to Gemini requesting a structured JSON response and returns
 * the parsed (but not yet validated) object. Callers should validate the shape.
 *
 * Pass `image` to run a vision prompt (flyer page extraction); omit it for the
 * text-only calls (page classification, recipe generation).
 */
export const generateJson = async (
  prompt: string,
  responseSchema: Schema,
  image?: ImageInput,
): Promise<unknown> => {
  const ai = createClient();

  // The image goes first: the model reads the instructions with the page already
  // in context, which matched how this was validated during design.
  const parts = image
    ? [{ inlineData: { mimeType: image.mimeType, data: image.data.toString('base64') } }, { text: prompt }]
    : [{ text: prompt }];

  let overloadRetries = 0;

  for (let attempt = 1; ; attempt++) {
    await acquireRateLimitSlot();

    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts }],
        config: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      return JSON.parse(text);
    } catch (error) {
      // Quota and server-overload errors are worth waiting out here; anything
      // else is a real failure and belongs to the caller, which knows whether
      // it can continue.
      if (isTransient(error) && overloadRetries < OVERLOAD_BACKOFF_MS.length) {
        const delay = OVERLOAD_BACKOFF_MS[overloadRetries++];
        console.warn(`   ⏳ Gemini unavailable (${statusOf(error)}), waiting ${delay / 1000} s (retry ${overloadRetries}/${OVERLOAD_BACKOFF_MS.length})...`);
        await sleep(delay);
        continue;
      }

      if (!isRateLimited(error) || attempt >= MAX_RATE_LIMIT_RETRIES) throw error;

      const delay = retryDelayFrom(error);
      console.warn(`   ⏳ Rate limited, waiting ${Math.round(delay / 1000)} s (attempt ${attempt}/${MAX_RATE_LIMIT_RETRIES})...`);
      await sleep(delay);
    }
  }
};
