import Link from "next/link";
import styles from "./Footer.module.scss";

/*
 * Only pages the main navigation doesn't reach. Recipes and the flyer are
 * already in the header and the phone tab bar, which sits right under the
 * footer — repeating them here read as a duplicate.
 */
const FOOTER_LINKS = [{ label: "O aplikácii", href: "/o-aplikacii" }] as const;

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.links} aria-label="Odkazy v pätičke">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className={styles.disclaimer}>
          Tento projekt je nezávislý a nie je oficiálne spojený, sponzorovaný ani schválený
          spoločnosťou Lidl Slovenská republika, v.o.s. Všetky ochranné známky a logá patria
          ich príslušným majiteľom.
        </p>
        <p className={styles.copyright}>
          &copy; {currentYear} My Cheap Chef. Vytvorené pre šikovných gurmánov.
        </p>
      </div>
    </footer>
  );
};
