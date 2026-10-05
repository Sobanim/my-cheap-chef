"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ChefHatIcon, HomeIcon, TagIcon } from "../icons";
import { isNavLinkActive, NAV_LINKS } from "@/lib/navigation";
import styles from "./BottomNav.module.scss";

const NAV_ICONS: Record<string, ReactNode> = {
  "/": <HomeIcon />,
  "/recipes": <ChefHatIcon />,
  "/catalog": <TagIcon />,
};

type PendingNavigation = { href: string; fromPathname: string };

/**
 * Phone-only tab bar (hidden above 640px, where the header nav takes over).
 * Lives in the root layout, so it stays mounted across navigations and the
 * active pill can slide between tabs instead of jumping.
 */
export const BottomNav = () => {
  const pathname = usePathname();
  /*
   * `usePathname` only changes once the next page has loaded, so on a slow
   * network the pill would lag behind the tap. Move it optimistically on click;
   * the pending entry is ignored as soon as the pathname moves on.
   */
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const effectivePathname = pending && pending.fromPathname === pathname ? pending.href : pathname;
  const activeIndex = NAV_LINKS.findIndex((link) => isNavLinkActive(effectivePathname, link));

  return (
    <nav className={styles.bar} aria-label="Hlavná navigácia">
      <div className={styles.items} data-active-index={activeIndex}>
        <span className={styles.indicator} aria-hidden="true" />
        {NAV_LINKS.map((link, index) => {
          const isActive = index === activeIndex;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setPending({ href: link.href, fromPathname: pathname })}
            >
              <span className={styles.icon}>{NAV_ICONS[link.href]}</span>
              <span className={styles.label}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
