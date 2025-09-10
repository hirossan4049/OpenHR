// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';

// Supported locales (keep in sync with navigation.ts & middleware)
const SUPPORTED_LOCALES = ['en', 'ja'] as const;
const DEFAULT_LOCALE = 'en';

type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export default getRequestConfig(async ({requestLocale}) => {
  const candidate = (await requestLocale) ?? DEFAULT_LOCALE;
  const locale: SupportedLocale = (SUPPORTED_LOCALES as readonly string[]).includes(candidate)
    ? (candidate as SupportedLocale)
    : DEFAULT_LOCALE;

  // Try to load the locale file, fallback to default if missing
  let messages: Record<string, any>;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default;
  }

  return { locale, messages };
});

