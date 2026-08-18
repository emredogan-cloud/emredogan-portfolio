import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { brandIcons } from '@/content/icons.generated';
import { stack } from '@/content/stack';

const root = process.cwd();

describe('brand icons', () => {
  it('the checked-in file matches what the generator produces', () => {
    // Guards the failure mode of any generated-and-committed file: someone
    // edits it by hand, or bumps `simple-icons`, and the two quietly disagree.
    const path = join(root, 'src/content/icons.generated.ts');
    const before = readFileSync(path, 'utf8');
    execFileSync('node', [join(root, 'scripts/generate-icons.mjs')], { stdio: 'ignore' });
    const after = readFileSync(path, 'utf8');
    expect(after, 'run `pnpm icons` and commit the result').toBe(before);
  });

  it('every icon has a drawable path and a title', () => {
    for (const icon of Object.values(brandIcons)) {
      expect(icon.path.length, `${icon.id} has no path`).toBeGreaterThan(10);
      expect(icon.title.length).toBeGreaterThan(1);
    }
  });
});

describe('technology stack', () => {
  it('every entry resolves to a generated icon', () => {
    for (const entry of stack) {
      expect(brandIcons[entry.id], `no icon for ${entry.label}`).toBeDefined();
    }
  });

  it('every technology names at least one project it was used in', () => {
    // A logo wall for things nobody has shipped anything with is decoration
    // pretending to be evidence.
    for (const entry of stack) {
      expect(entry.usedIn.length, `${entry.label} claims no project`).toBeGreaterThan(0);
    }
  });

  it('has no duplicates', () => {
    const ids = stack.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is long enough to fill a wide viewport twice over', () => {
    // The track renders two copies; too few entries and the seam is visible.
    expect(stack.length).toBeGreaterThanOrEqual(10);
  });
});
