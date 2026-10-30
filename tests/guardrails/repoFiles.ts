import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const repoRoot = join(import.meta.dirname, '..', '..');

/** Recursively list files under a repo-relative directory. */
export function listFiles(dir: string, extensions: readonly string[]): string[] {
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const entry of readdirSync(abs)) {
      const full = join(abs, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        out.push(relative(repoRoot, full));
      }
    }
  };
  walk(join(repoRoot, dir));
  return out;
}

export function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8');
}
