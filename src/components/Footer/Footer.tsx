import Link from "next/link";
import styles from "./Footer.module.scss";

const FOOTER_LINKS = [
  { label: "O aplikácii", href: "/o-aplikacii" },
  { label: "Recepty", href: "/recipes" },
  { label: "Akcie z letáku", href: "/catalog" },
] as const;

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
