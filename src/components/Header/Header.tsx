import styles from "./Header.module.scss";
import { ChefHatLogo } from "./ChefHatLogo";

const NAV_LINKS = [
  { label: "Domov", href: "#", active: true },
  { label: "Recepty", href: "#recepty", active: false },
  { label: "Zľavy", href: "#zlavy", active: false },
] as const;

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logoBadge}>
            <ChefHatLogo className={styles.logoIcon} />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandTitle}>My Cheap Chef</span>
            <span className={styles.brandSubtitle}>Varím zo zliav</span>
          </span>
        </div>

        <nav className={styles.nav} aria-label="Hlavná navigácia">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`${styles.navLink} ${link.active ? styles.navLinkActive : ""}`}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right section intentionally left empty per design spec */}
        <div className={styles.rightSpacer} aria-hidden="true" />
      </div>
    </header>
  );
};
