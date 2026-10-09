"use client";

import { useContext } from "react";
import { ThemeContext } from "@/providers/theme-provider";
import type { Theme } from "@/types";

/**
 * useTheme Hook
 *
 * Provides access to the current theme and the setter function.
 * Must be used within a <ThemeProvider>.
 *
 * Usage:
 *   const { theme, setTheme, themes } = useTheme();
 *
 * Returns:
 *   - theme:    Current active theme ("light" | "dark" | "stadium" | "neon")
 *   - setTheme: Function to change the theme
 *   - themes:   Array of all available themes with labels and icons
 */
export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; icon: string }[];
} {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }

  return context;
}
