import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, RecipeFeed } from "@/components";
import { loadCatalogData } from "@/lib/catalogData";
import { loadRecipeData } from "@/lib/recipeData";
import { splitRecipesByAvailability } from "@/lib/recipeAvailability";
import { pluralizeRecipes } from "@/lib/recipeLabels";
import { BASE_OPEN_GRAPH } from "@/lib/site";
import { buildFaqJsonLd, type FaqItem } from "@/lib/structuredData";
import styles from "./page.module.scss";

// The example recipes follow the weekday, same as the home page.
export const revalidate = 3600;

const PAGE_PATH = "/o-aplikacii";

export const metadata: Metadata = {
  title: "Čo variť z akciového letáku Lidl — recepty zo zliav",
  description:
    "My Cheap Chef každý týždeň zostaví lacné recepty z potravín v akcii v letáku Lidl. Zadarmo, bez registrácie — s cenou za porciu, úsporou a presným postupom.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { ...BASE_OPEN_GRAPH, url: PAGE_PATH },
};

/** How many of this week's recipes are shown as a live example. */
const EXAMPLE_RECIPE_COUNT = 3;

type Highlight = {
  title: string;
  text: string;
};

const PROBLEMS: readonly Highlight[] = [
  {
    title: "„Čo dnes variť?“",
    text: "Tá istá otázka každý deň. Nápady sa míňajú a nakoniec sa varí stále to isté.",
  },
  {
    title: "Leták má desiatky strán",
    text: "Zľavy v ňom sú, no nikto nepovie, aké jedlo sa z nich dá poskladať.",
  },
  {
    title: "Zľava, ktorá skončí v koši",
    text: "Kúpite výhodne, ale bez plánu sa polovica nákupu nestihne spotrebovať.",
  },
];

const STEPS: readonly Highlight[] = [
  {
    title: "Prečítame leták za vás",
    text: "Každý pondelok spracujeme nový akciový leták Lidl a vyberieme z neho všetky potraviny v akcii.",
  },
  {
    title: "Zostavíme z neho recepty",
    text: "Z akciových potravín vznikne 12 jedál na týždeň. Ceny a úsporu počítame priamo z cien v letáku, nie odhadom.",
  },
  {
    title: "Vy len nakúpite a varíte",
    text: "Pri každom recepte vidíte, čo je v akcii, čo už máte doma a čo treba dokúpiť.",
  },
];

const BENEFITS: readonly Highlight[] = [
  {
    title: "Cena ešte pred nákupom",
    text: "Každý recept ukazuje, koľko stoja akciové suroviny na 2 porcie a koľko ušetríte oproti bežnej cene.",
  },
  {
    title: "Poctivé zľavy",
    text: "Úsporu uvádzame len tam, kde leták uvádza aj pôvodnú cenu. Žiadne vymyslené percentá.",
  },
  {
    title: "Recepty podľa platnosti akcií",
    text: "Lidl spúšťa zľavy v pondelok, vo štvrtok a v sobotu. Recepty sa odomykajú v ten istý deň, takže akcia vždy platí.",
  },
  {
    title: "Presný postup",
    text: "Gramy, minúty a stupne namiesto „podľa chuti“. Recepty zvládne aj začiatočník.",
  },
];

const FAQ: readonly FaqItem[] = [
  {
    question: "Je My Cheap Chef zadarmo?",
    answer: "Áno. Aplikácia je zadarmo a nevyžaduje registráciu ani inštaláciu.",
  },
  {
    question: "Odkiaľ sú ceny a zľavy?",
    answer:
      "Z aktuálneho akciového letáku Lidl Slovensko. Úsporu počítame z cien vytlačených v letáku a uvádzame ju len tam, kde leták uvádza aj pôvodnú cenu.",
  },
  {
    question: "Ako často pribúdajú nové recepty?",
    answer:
      "Každý týždeň s novým letákom vznikne 12 receptov. Prvé sú dostupné od pondelka, ďalšie sa odomknú vo štvrtok a v sobotu — vtedy, keď začnú platiť príslušné akcie.",
  },
  {
    question: "Pre koľko osôb sú recepty?",
    answer: "Každý recept je rozpočítaný na 2 porcie, čo zodpovedá bežnej veľkosti balení v Lidli.",
  },
  {
    question: "Musím mať Lidl Plus?",
    answer:
      "Nie. Niektoré ceny v letáku však platia len s aplikáciou Lidl Plus — v prehľade akcií sú takéto ponuky označené.",
  },
  {
    question: "Dá sa aplikácia pridať do telefónu?",
    answer:
      "Áno. Otvorte stránku v prehliadači telefónu a zvoľte „Pridať na plochu“. My Cheap Chef sa potom spúšťa ako bežná aplikácia.",
  },
  {
    question: "Je to oficiálna aplikácia spoločnosti Lidl?",
    answer:
      "Nie. My Cheap Chef je nezávislý projekt a nie je spojený so spoločnosťou Lidl Slovenská republika. Platné ceny si vždy overte v predajni.",
  },
];

/**
 * The promo / landing page: explains in plain words what the app does, for
 * people (and search engines, and AI assistants) who meet it for the first
 * time. The home page stays the app itself — returning visitors and the
 * installed PWA open straight into this week's recipes.
 */
export default async function AboutPage() {
  const now = new Date();
  const [{ recipes }, catalog] = await Promise.all([loadRecipeData(), loadCatalogData()]);
  const { unlocked, locked } = splitRecipesByAvailability(recipes, now);

  const weeklyRecipeCount = unlocked.length + locked.length;
  const exampleRecipes = unlocked.slice(0, EXAMPLE_RECIPE_COUNT);

  return (
    <>
      <JsonLd data={buildFaqJsonLd(FAQ)} />

      <header className={styles.hero}>
        <div className={styles.glow} aria-hidden="true" />
        <p className={styles.eyebrow}>Varím zo zliav</p>
        <h1 className={styles.title}>Čo variť z akciového letáku Lidl</h1>
        <p className={styles.lead}>
          My Cheap Chef každý týždeň prejde celý leták Lidl a z potravín v akcii zostaví hotové recepty — s cenou
          za porciu, úsporou oproti bežnej cene a presným postupom.
        </p>

        <div className={styles.actions}>
          <Link href="/recipes" className={styles.primaryAction}>
            Recepty tohto týždňa
          </Link>
          <Link href="/catalog" className={styles.secondaryAction}>
            Akcie z letáku
          </Link>
        </div>

        <dl className={styles.stats}>
          {catalog.products.length > 0 && (
            <div className={styles.stat}>
              <dt className={styles.statLabel}>potravín z letáku</dt>
              <dd className={styles.statValue}>{catalog.products.length}</dd>
            </div>
          )}
          {weeklyRecipeCount > 0 && (
            <div className={styles.stat}>
              <dt className={styles.statLabel}>{pluralizeRecipes(weeklyRecipeCount)} tento týždeň</dt>
              <dd className={styles.statValue}>{weeklyRecipeCount}</dd>
            </div>
          )}
          <div className={styles.stat}>
            <dt className={styles.statLabel}>bez registrácie</dt>
            <dd className={styles.statValue}>0 €</dd>
          </div>
        </dl>
      </header>

      <section className={styles.section} aria-labelledby="problems-heading">
        <h2 id="problems-heading" className={styles.heading}>
          Poznáte to?
        </h2>
        <ul className={styles.cards}>
          {PROBLEMS.map((problem) => (
            <li key={problem.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{problem.title}</h3>
              <p className={styles.cardText}>{problem.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="steps-heading">
        <h2 id="steps-heading" className={styles.heading}>
          Ako to funguje
        </h2>
        <ol className={styles.cards}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={styles.card}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {exampleRecipes.length > 0 && (
        <RecipeFeed recipes={exampleRecipes} heading="Ukážka z tohto týždňa" showCount={false} />
      )}

      <section className={styles.section} aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className={styles.heading}>
          Prečo variť zo zliav s nami
        </h2>
        <ul className={`${styles.cards} ${styles.cardsWide}`}>
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{benefit.title}</h3>
              <p className={styles.cardText}>{benefit.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="faq-heading">
        <h2 id="faq-heading" className={styles.heading}>
          Časté otázky
        </h2>
        <div className={styles.faq}>
          {FAQ.map((item) => (
            <details key={item.question} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{item.question}</summary>
              <p className={styles.faqAnswer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="cta-heading">
        <h2 id="cta-heading" className={styles.ctaTitle}>
          Pozrite si, čo sa dá uvariť tento týždeň
        </h2>
        <p className={styles.ctaText}>Nový leták, nové recepty — každý pondelok.</p>
        <Link href="/recipes" className={styles.primaryAction}>
          Zobraziť recepty
        </Link>
      </section>
    </>
  );
}
