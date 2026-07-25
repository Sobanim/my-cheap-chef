"use client";

import styles from "./Header.module.scss";
import { ChefHatLogo } from "../icons";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Domov", href: "/" },
  { label: "Zľavy", href: "/discounts" },
  { label: "Recepty", href: "/recipes" },
] as const;

export const Header = () => {
  const pathname = usePathname();

  const isLinkActive = (pathname: string, href: string) => {
    if (pathname === href) return true;
    if (href === "/") return false;
    if (href.startsWith("#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <ChefHatLogo className={styles.logoIcon} />
          <span className={styles.brandText}>
            <span className={styles.brandTitle}>My Cheap Chef</span>
            <span className={styles.brandSubtitle}>Varím zo zliav</span>
          </span>
        </div>

        <nav className={styles.nav} aria-label="Hlavná navigácia">
          {NAV_LINKS.map((link) => {
            const isActive = isLinkActive(pathname, link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.rightSection}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
