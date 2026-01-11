import fs from 'node:fs';
import path from 'node:path';

const messagesDir = path.join(process.cwd(), 'messages');

const loadMessages = (locale: string) =>
  JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8'));

const collectKeys = (value: unknown, prefix = ''): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectKeys(item, prefix ? `${prefix}[${index}]` : `${index}`),
    );
  }

  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).flatMap((key) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      return collectKeys((value as Record<string, unknown>)[key], nextPrefix);
    });
  }

  return prefix ? [prefix] : [];
};

describe('translations', () => {
  it('en and ja share the same message keys', () => {
    const enKeys = collectKeys(loadMessages('en'));
    const jaKeys = collectKeys(loadMessages('ja'));

    const missingInJa = enKeys.filter((key) => !jaKeys.includes(key));
    const missingInEn = jaKeys.filter((key) => !enKeys.includes(key));

    expect(missingInJa).toEqual([]);
    expect(missingInEn).toEqual([]);
  });
});
