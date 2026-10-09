/**
 * Helper to retrieve a dual-language field with automatic English fallback.
 * Example: getLocalizedField(article, 'title', 'fa') -> checks article.titleFa || article.title
 */
export function getLocalizedField<T extends Record<string, any>>(
  entity: T | null | undefined,
  field: string,
  locale: string
): string {
  if (!entity) return "";

  if (locale === "fa") {
    const faField = `${field}Fa`;
    if (entity[faField] && typeof entity[faField] === "string" && entity[faField].trim().length > 0) {
      return entity[faField];
    }
  }

  return (entity[field] as string) || "";
}

/**
 * Converts Western digits (0-9) to Eastern Arabic/Persian digits (۰-۹)
 * when the locale is Persian ('fa').
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  const str = input.toString();
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)]);
}

/**
 * Formats a number according to the active locale.
 */
export function formatLocalizedNumber(num: number | null | undefined, locale: string): string {
  if (num === null || num === undefined) return "—";
  if (locale === "fa") {
    return toPersianDigits(num);
  }
  return num.toLocaleString("en-US");
}

/**
 * Formats a date using Shamsi (Solar Hijri) calendar for Persian ('fa')
 * and Gregorian calendar for English ('en').
 */
export function formatLocalizedDate(
  dateInput: string | Date | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (locale === "fa") {
    // Solar Hijri / Jalali calendar format via native browser Intl API
    try {
      const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", defaultOptions);
      return formatter.format(date);
    } catch {
      return date.toLocaleDateString("fa-IR");
    }
  }

  return date.toLocaleDateString("en-US", defaultOptions);
}
