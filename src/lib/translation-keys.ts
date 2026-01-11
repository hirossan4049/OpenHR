/**
 * Recursively collect translation key paths.
 * Uses dot notation for objects (e.g., "section.title") and bracket notation for arrays (e.g., "items[0]").
 */
export const collectTranslationKeys = (value: unknown, prefix = ''): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      const nextPrefix = prefix ? `${prefix}[${index}]` : `${index}`;
      return collectTranslationKeys(item, nextPrefix);
    });
  }

  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).flatMap((key) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      return collectTranslationKeys((value as Record<string, unknown>)[key], nextPrefix);
    });
  }

  return prefix ? [prefix] : [];
};

/**
 * Returns keys that exist in `source` but are missing from `target`.
 */
export const findMissingKeys = (source: unknown, target: unknown): string[] => {
  const targetKeys = new Set(collectTranslationKeys(target));
  return collectTranslationKeys(source).filter((key) => !targetKeys.has(key));
};
