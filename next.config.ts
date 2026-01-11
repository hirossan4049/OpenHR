// next.config.ts（プロジェクト直下）
import fs from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const validateTranslations = () => {
  const basePath = path.join(process.cwd(), 'messages');
  const load = (locale: string) =>
    JSON.parse(fs.readFileSync(path.join(basePath, `${locale}.json`), 'utf8'));

  const compareKeys = (
    source: Record<string, any>,
    target: Record<string, any>,
    missing: string[],
    prefix = '',
  ) => {
    if (typeof source !== 'object' || source === null) return;

    for (const key of Object.keys(source)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (!(target && key in target)) {
        missing.push(fullKey);
        continue;
      }

      const sourceValue = source[key];
      const targetValue = target[key];

      if (typeof sourceValue === 'object' && sourceValue !== null) {
        compareKeys(sourceValue, targetValue as Record<string, any>, missing, fullKey);
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

validateTranslations();

const nextConfig: NextConfig = {};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
