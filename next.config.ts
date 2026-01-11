// next.config.ts (project root)
import fs from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { findMissingKeys } from './src/lib/translation-keys';

const validateTranslations = () => {
  const basePath = path.join(process.cwd(), 'messages');
  const load = (locale: string) => {
    const filePath = path.join(basePath, `${locale}.json`);
    try {
      return JSON.parse(
        fs.readFileSync(filePath, 'utf8'),
      ) as Record<string, unknown>;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load messages for locale "${locale}": ${reason}`);
    }
  };

  const en = load('en');
  const ja = load('ja');

  const missingInJa = findMissingKeys(en, ja);
  const missingInEn = findMissingKeys(ja, en);

  if (missingInJa.length || missingInEn.length) {
    const messages = [
      missingInJa.length ? `Missing keys in ja: ${missingInJa.join(', ')}` : '',
      missingInEn.length ? `Missing keys in en: ${missingInEn.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    throw new Error(`Translation keys mismatch:\n${messages}`);
  }
};

const skipTranslationValidation =
  typeof process.env.SKIP_TRANSLATION_VALIDATION === 'string' &&
  ['1', 'true'].includes(
    process.env.SKIP_TRANSLATION_VALIDATION.toLowerCase(),
  );

// Set SKIP_TRANSLATION_VALIDATION to "1" or "true" to skip translation checks when debugging locally.
if (!skipTranslationValidation) {
  validateTranslations();
}

const nextConfig: NextConfig = {};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
