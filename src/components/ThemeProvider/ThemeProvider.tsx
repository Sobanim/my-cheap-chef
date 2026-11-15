"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

const COOKIE_KEY = "mcc-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const SYSTEM_LIGHT_QUERY = "(prefers-color-scheme: light)";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
  /** The visitor's explicit choice, read from the cookie on the server. Absent = follow the system. */
  initialTheme?: Theme;
  children: React.ReactNode;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Persist the choice as a cookie so the server can render the right theme on the next request.
const persistTheme = (theme: Theme) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_KEY}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
};

const subscribeToSystemTheme = (onChange: () => void) => {
  const query = window.matchMedia(SYSTEM_LIGHT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getSystemTheme = (): Theme => (window.matchMedia(SYSTEM_LIGHT_QUERY).matches ? "light" : "dark");

// The server can't know the system preference; dark matches the CSS default.
// useSyncExternalStore re-renders with the real value right after hydration.
const getServerSystemTheme = (): Theme => "dark";

export const ThemeProvider = ({ initialTheme, children }: Readonly<ThemeProviderProps>) => {
  // null = the visitor never picked a theme, so the system preference applies.
  const [chosenTheme, setChosenTheme] = useState<Theme | null>(initialTheme ?? null);
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, getServerSystemTheme);
  const theme = chosenTheme ?? systemTheme;

  /*
   * Only an explicit choice is written to <html> and to the cookie. Without one
   * the attribute stays off and CSS follows `prefers-color-scheme` on its own —
   * persisting the resolved system theme here would freeze it on the first visit
   * and the site would stop following the OS setting.
   */
  useEffect(() => {
    if (!chosenTheme) return;
    document.documentElement.setAttribute("data-theme", chosenTheme);
    persistTheme(chosenTheme);
  }, [chosenTheme]);

  const setTheme = useCallback((next: Theme) => setChosenTheme(next), []);
  const toggleTheme = useCallback(
    () => setChosenTheme(theme === "dark" ? "light" : "dark"),
    [theme],
  );

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};
