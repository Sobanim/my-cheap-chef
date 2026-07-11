"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

const COOKIE_KEY = "mcc-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
  initialTheme?: Theme;
  children: React.ReactNode;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Persist theme choice as a cookie so the server can read it on next request.
const persistTheme = (theme: Theme) => {
  document.cookie = `${COOKIE_KEY}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

// Determine the effective theme on the client (for first render when no cookie exists).
const resolveClientTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

export const ThemeProvider = ({ initialTheme, children }: Readonly<ThemeProviderProps>) => {
  // If the server passed a theme from the cookie, use it; otherwise fall back to system preference.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (initialTheme) return initialTheme;

    if (typeof window === "undefined") return "dark";

    return resolveClientTheme();
  });

  // Reflect the current theme on <html> and persist the choice.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    persistTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
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
