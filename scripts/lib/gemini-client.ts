/**
 * Thin wrapper around the Gemini API for JSON generation.
 * Used by the offline recipe-generation script (not by the web app).
 */

import { GoogleGenAI, type Schema } from '@google/genai';

const MODEL = 'gemini-3.1-flash-lite';

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
 */
export const generateJson = async (prompt: string, responseSchema: Schema): Promise<unknown> => {
  const ai = createClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
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
};
