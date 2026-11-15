/**
 * Slovak number formatting.
 *
 * Slovak writes decimals with a comma ("2,37 €", "0,5 ČL"). Prices are numbers
 * we format ourselves; amounts and steps are text written by the model, which
 * tends to use a decimal point, so that text is corrected at render time
 * instead of trusting the prompt to always get it right.
 */

/** `2.37` → `2,37 €`. */
export const formatEuro = (value: number): string => `${value.toFixed(2).replace('.', ',')} €`;

/**
 * Swaps decimal points for commas inside free text: `0.5 ČL` → `0,5 ČL`.
 * Only touches a point that sits between two digits, so sentence-ending dots,
 * dates like `9. 11.` and temperatures are left alone.
 */
export const localizeDecimals = (text: string): string => text.replace(/(\d)\.(\d)/g, '$1,$2');
