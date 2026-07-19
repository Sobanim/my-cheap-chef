import { getDiscountCycle } from "@/lib/dateUtils";
import { pluralizeRecipes } from "@/lib/recipeLabels";

export type GreetingInfo = {
  /** e.g. "Dobré ráno!" */
  greeting: string;
  /** Small emoji accent used in the greeting line */
  emoji: string;
  /** Slovak weekday name, e.g. "pondelok" */
  dayName: string;
  /** Full descriptive body text about current availability */
  body: string;
};

const DAY_NAMES_SK = [
  "nedeľa",
  "pondelok",
  "utorok",
  "streda",
  "štvrtok",
  "piatok",
  "sobota",
];

/**
 * Time-of-day greeting in Slovak.
 */
const getTimeGreeting = (hour: number): { greeting: string; emoji: string } => {
  if (hour < 10) return { greeting: "Dobré ráno!", emoji: "☀️" };
  if (hour < 18) return { greeting: "Dobrý deň!", emoji: "🍽️" };
  return { greeting: "Dobrý večer!", emoji: "🌙" };
};

/**
 * Builds the dynamic greeting message from how many recipes are actually
 * unlocked right now. Lidl discount calendar:
 *  - Mon–Wed: basket A only
 *  - Thu–Fri: baskets A + B
 *  - Sat–Sun: everything, including the weekend-only basket C
 */
export const buildGreeting = (
  now: Date,
  unlockedCount: number,
  lockedCount: number,
): GreetingInfo => {
  const day = now.getDay();
  const { greeting, emoji } = getTimeGreeting(now.getHours());
  const dayName = DAY_NAMES_SK[day];
  const { isFirstHalf } = getDiscountCycle(now);

  const unlockedPhrase = `${unlockedCount} ${pluralizeRecipes(unlockedCount)}`;

  let body: string;
  if (unlockedCount === 0) {
    body = `Dnes je ${dayName}. Práve pripravujeme nové recepty z aktuálnych zliav — vráť sa o chvíľu!`;
  } else if (lockedCount === 0) {
    body = `Dnes je ${dayName}. Bežia všetky akcie tohto týždňa, takže máte k dispozícii ${unlockedPhrase} vrátane víkendových.`;
  } else if (isFirstHalf) {
    body = `Dnes je ${dayName}. V letáku sú zľavy od pondelka do stredy, preto sme pre vás vybrali ${unlockedPhrase}. Ďalšie jedlá odomkneme vo štvrtok s novými akciami!`;
  } else {
    body = `Dnes je ${dayName}. Bežia druhopolčasové zľavy, tak sme pre vás pripravili ${unlockedPhrase}. Víkendové jedlá odomkneme v sobotu!`;
  }

  return { greeting, emoji, dayName, body };
};

/**
 * Slovak weekday name for a given day index (0 = Sunday).
 */
export const getSlovakDayName = (day: number): string => DAY_NAMES_SK[day] ?? "";
