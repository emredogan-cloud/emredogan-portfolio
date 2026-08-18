import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const workflow = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8');

/**
 * The workflow with comment lines removed.
 *
 * Assertions about what CI *runs* must not match the comments explaining why it
 * does not run something — the first version of the apt check failed on its own
 * rationale.
 */
const executed = workflow
  .split('\n')
  .filter((line) => !/^\s*#/.test(line))
  .join('\n');
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  devDependencies: Record<string, string>;
};

describe('CI configuration', () => {
  it('pins the Playwright image to the installed Playwright version', () => {
    // The browser jobs run inside Playwright's own image so `apt` is not on
    // the critical path. If the image tag and the npm package drift, the image
    // ships the wrong browsers and every browser job silently downloads them
    // again — which is the cost the image was adopted to avoid.
    const installed = manifest.devDependencies['@playwright/test'];
    expect(installed, '@playwright/test is not pinned to an exact version').toMatch(
      /^\d+\.\d+\.\d+$/,
    );

    const image = executed.match(/mcr\.microsoft\.com\/playwright:v([\d.]+)-/)?.[1];
    expect(image, 'no Playwright image tag found in the workflow').toBeDefined();
    expect(image, 'bump the container image tag alongside @playwright/test').toBe(installed);
  });

  it('does not install system dependencies through apt', () => {
    // `--with-deps` shells out to apt, which stalled past an eight-minute
    // timeout and failed two jobs over a network hiccup.
    expect(executed).not.toContain('--with-deps');
    expect(executed).not.toContain('install-deps');
  });

  it('runs every browser engine', () => {
    for (const engine of ['chromium', 'firefox', 'webkit']) {
      expect(executed).toContain(engine);
    }
  });

  it('gates the pipeline on every job succeeding', () => {
    expect(executed).toContain('Require every job to have succeeded');
  });
});
