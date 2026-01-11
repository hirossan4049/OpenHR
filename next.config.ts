// next.config.ts（プロジェクト直下）
import fs from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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

  const compareKeys = (
    source: Record<string, unknown>,
    target: unknown,
    missing: string[],
    prefix = '',
  ) => {
    if (!isObject(source)) return;
    const targetObject = isObject(target) ? target : undefined;

    for (const key of Object.keys(source)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (!(targetObject && key in targetObject)) {
        missing.push(fullKey);
        continue;
      }

      const sourceValue = source[key];
      const targetValue = targetObject[key];

      if (isObject(sourceValue)) {
        compareKeys(
          sourceValue,
          isObject(targetValue) ? targetValue : undefined,
          missing,
          fullKey,
        );
      }
    }
  };

  const en = load('en');
  const ja = load('ja');

  const missingInJa: string[] = [];
  const missingInEn: string[] = [];

  compareKeys(en, ja, missingInJa);
  compareKeys(ja, en, missingInEn);

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

const shouldValidateTranslations =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NODE_ENV === 'production';

if (shouldValidateTranslations) {
  validateTranslations();
}

const nextConfig: NextConfig = {};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
