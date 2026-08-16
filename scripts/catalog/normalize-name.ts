/**
 * The one way product names are folded for comparison.
 *
 * Shared deliberately: Step 3 uses it to decide that two flyer entries are the
 * same product, and Step 4 records it so a future run can ask whether it saw
 * that product before. If the two ever drifted apart, price history would stop
 * lining up with the catalog it was derived from.
 */

/** Lowercases, strips diacritics and punctuation: "BRAVČOVÁ krkovička®" → "bravcova krkovicka". */
export const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
