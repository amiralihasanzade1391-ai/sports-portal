"use client";

import { useEffect, useState } from "react";

/**
 * useMediaQuery Hook
 *
 * Reactively tracks whether a CSS media query matches.
 * Returns `false` during SSR to avoid hydration mismatches,
 * then updates on the client.
 *
 * Usage:
 *   const isMobile  = useMediaQuery("(max-width: 768px)");
 *   const isTablet  = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
 *   const isDesktop = useMediaQuery("(min-width: 1025px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
