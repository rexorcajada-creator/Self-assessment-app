// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { listFiles, readRepoFile } from './repoFiles.ts';

// Plain informational links to official HMRC guidance are allowed in later
// phases; they are user-clicked links, not loaded resources.
const ALLOWED_URL_PREFIXES = ['https://www.gov.uk/'];

const URL_PATTERN = /\bhttps?:\/\/[^\s'"`)<>]+/g;

function disallowedUrls(text: string): string[] {
  return (text.match(URL_PATTERN) ?? []).filter(
    (url) => !ALLOWED_URL_PREFIXES.some((prefix) => url.startsWith(prefix)),
  );
}

const sourceFiles = listFiles('src', ['.ts', '.tsx', '.css']).filter((f) => !f.includes('.test.'));

describe('no remote resources or network calls', () => {
  it('index.html loads nothing from another origin', () => {
    expect(disallowedUrls(readRepoFile('index.html'))).toEqual([]);
  });

  it('app source contains no remote URLs', () => {
    const found = sourceFiles.flatMap((file) => disallowedUrls(readRepoFile(file)).map((url) => `${file}: ${url}`));
    expect(found).toEqual([]);
  });

  it('app source uses no network APIs', () => {
    const networkApi = /\b(fetch\s*\(|XMLHttpRequest|sendBeacon|new\s+WebSocket|new\s+EventSource)/;
    const found = sourceFiles.filter((file) => networkApi.test(readRepoFile(file)));
    expect(found).toEqual([]);
  });
});
