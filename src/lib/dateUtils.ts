/**
 * Checks if a product is active at the given reference time (in Unix seconds).
 */
export const isProductActive = (
  validFrom: number | null,
  validUntil: number | null,
  referenceTimeSeconds: number
): boolean => {
  if (!validFrom || !validUntil) return true;
  return referenceTimeSeconds >= validFrom && referenceTimeSeconds <= validUntil;
};

/**
 * Checks if a product is upcoming at the given reference time (in Unix seconds).
 */
export const isProductUpcoming = (
  validFrom: number | null,
  referenceTimeSeconds: number
): boolean => {
  if (!validFrom) return false;
  return referenceTimeSeconds < validFrom;
};

/**
 * Formats a Slovak prepositional day phrase based on the day of the week.
 * @param dayOfWeek 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export const getSlovakPrepPhrase = (dayOfWeek: number): string => {
  const phrases = [
    'od nedele',    // Sunday
    'od pondelka',  // Monday
    'od utorka',    // Tuesday
    'od stredy',    // Wednesday
    'od štvrtka',   // Thursday
    'od piatku',    // Friday
    'od soboty',    // Saturday
  ];
  return phrases[dayOfWeek] ?? 'čoskoro';
};
