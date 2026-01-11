import fs from 'node:fs';
import path from 'node:path';
import { findMissingKeys } from '~/lib/translation-keys';

const messagesDir = path.join(process.cwd(), 'messages');

const loadMessages = (locale: string) =>
  JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8'));

describe('translations', () => {
  it('en and ja share the same message keys', () => {
    const enMessages = loadMessages('en');
    const jaMessages = loadMessages('ja');

    const missingInJa = findMissingKeys(enMessages, jaMessages);
    const missingInEn = findMissingKeys(jaMessages, enMessages);

    expect(missingInJa).toEqual([]);
    expect(missingInEn).toEqual([]);
  });
});
