export type NavLink = {
  label: string;
  href: string;
  /** Other path prefixes that belong to this section, e.g. a recipe detail under "Recepty". */
  matchPrefixes?: readonly string[];
};

/**
 * Main navigation, shared by the header (desktop) and the bottom tab bar (phones).
 * `/discounts` is intentionally absent — the page stays reachable by URL only.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Domov', href: '/' },
  { label: 'Recepty', href: '/recipes', matchPrefixes: ['/recipe/'] },
  { label: 'Leták', href: '/catalog' },
];

export const isNavLinkActive = (pathname: string, link: NavLink): boolean => {
  if (pathname === link.href) return true;
  // Home would otherwise match every path.
  if (link.href === '/') return false;
  if (pathname.startsWith(`${link.href}/`)) return true;
  return link.matchPrefixes?.some((prefix) => pathname.startsWith(prefix)) ?? false;
};
