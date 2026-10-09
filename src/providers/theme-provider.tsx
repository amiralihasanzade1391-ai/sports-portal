"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Theme } from "@/types";

/* ──────────────────────────────────────────────────────────
 * Theme Context
 *
 * Supports 4 modes: light | dark | stadium | neon
 * - Persists selection in localStorage
 * - Applies the theme class to <html> so Tailwind + CSS
 *   variables in globals.css activate automatically
 * - Falls back to system preference on first visit
 * ────────────────────────────────────────────────────────── */

const STORAGE_KEY = "sports-portal-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; icon: string }[];
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

const THEMES: ThemeContextValue["themes"] = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "stadium", label: "Stadium Green", icon: "🏟️" },
  { value: "neon", label: "Neon Night", icon: "⚡" },
];

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Hydrate theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored ?? getSystemTheme();
    setThemeState(initial);
    setMounted(true);
  }, []);

  // Apply theme class to <html> whenever it changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark", "stadium", "neon");
    root.classList.add(theme);

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
