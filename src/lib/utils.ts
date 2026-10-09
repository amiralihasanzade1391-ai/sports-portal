import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper precedence handling.
 * Combines clsx (conditional classes) with tailwind-merge (dedup).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date object into a human-readable string.
 * Example: "Oct 8, 2026"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a Date object into a relative time string.
 * Example: "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Formats a match time (e.g., "45'" or "HT" or "FT").
 */
export function formatMatchTime(
  minute: number | null,
  status: string
): string {
  if (status === "FINISHED") return "FT";
  if (status === "HALF_TIME") return "HT";
  if (status === "NOT_STARTED") return "—";
  if (minute !== null) return `${minute}'`;
  return "—";
}

/**
 * Truncates a string to a given length, adding "..." if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Generates a URL-friendly slug from a string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns initials from a name (e.g., "John Doe" → "JD").
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
