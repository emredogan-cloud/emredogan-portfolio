#!/usr/bin/env node
/**
 * First-load budget checker.
 *
 * Measures what a browser in the support matrix is actually told to fetch:
 * every non-`noModule` `<script src>` and every `<link rel="stylesheet">` in
 * each prerendered document, summed as gzip.
 *
 * Two deliberate choices:
 *
 *  1. **Not a glob over `.next/static/chunks`.** That counts chunks no route
 *     ever loads and reports several times the truth.
 *  2. **`noModule` scripts are excluded.** The legacy polyfill bundle (~38 KB
 *     gz) is only fetched by browsers without ES-module support, which are
 *     outside the support matrix in `docs/BROWSER_SUPPORT.md`. Charging it to
 *     every user's budget would be measuring a payload nobody receives.
 *
 * The framework floor is measured, not assumed: `_global-error.html` renders
 * essentially nothing, so its payload is the Next + React baseline. The
 * first-party budget is the delta above it — the only part this codebase
 * controls.
 *
 * Budgets come from PERSONAL_WEBSITE_EXECUTION_ROADMAP.md §7 and are a hard
 * contract. Raising one to make a build pass is forbidden by
 * WORKING_DISCIPLINE.md §7.2.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const NEXT_DIR = '.next';
const APP_DIR = join(NEXT_DIR, 'server', 'app');
const KB = 1024;

/** gzip-compressed budgets, in KB. */
const BUDGETS = {
  /** Total modern first-load JS on the heaviest route. */
  totalJs: 175,
  /** JS above the measured Next + React floor — the part we author. */
  firstPartyJs: 45,
  css: 30,
};

/** Document whose payload defines the framework floor. */
const BASELINE_DOCUMENT = '_global-error.html';

let failed = false;
const fail = (message) => {
  console.error(`\x1b[31m✖\x1b[0m ${message}`);
  failed = true;
};
const pass = (message) => console.log(`\x1b[32m✔\x1b[0m ${message}`);

function htmlFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });
}

function resolveAsset(url) {
  const clean = url.split('?')[0];
  if (!clean.startsWith('/_next/')) return null;
  const path = join(NEXT_DIR, clean.slice('/_next/'.length));
  return existsSync(path) && statSync(path).isFile() ? path : null;
}

const gzipCache = new Map();
function gzipSizeOf(path) {
  if (!gzipCache.has(path)) gzipCache.set(path, gzipSync(readFileSync(path)).length);
  return gzipCache.get(path);
}

function measure(documentPath) {
  const html = readFileSync(documentPath, 'utf8');

  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)]
    .map((m) => m[1])
    .filter((attrs) => !/\bnomodule\b/i.test(attrs))
    .map((attrs) => attrs.match(/\bsrc="([^"]+)"/)?.[1])
    .filter(Boolean);

  const styles = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)]
    .map((m) => m[0].match(/\bhref="([^"]+)"/)?.[1])
    .filter(Boolean);

  const sum = (urls) =>
    [...new Set(urls)].reduce((total, url) => {
      const path = resolveAsset(url);
      return path ? total + gzipSizeOf(path) : total;
    }, 0);

  return { js: sum(scripts), css: sum(styles) };
}

const documents = htmlFiles(APP_DIR);
if (documents.length === 0) {
  fail(`No prerendered documents under ${APP_DIR}. Run \`pnpm build\` first.`);
  process.exit(1);
}

const baselineDoc = documents.find((d) => basename(d) === BASELINE_DOCUMENT);
const baselineJs = baselineDoc ? measure(baselineDoc).js : 0;

let worst = { js: 0, css: 0, route: '' };

console.log('\nFirst-load payload per prerendered route — gzipped, modern browsers\n');
console.log(
  `  ${'document'.padEnd(28)}${'JS'.padStart(11)}${'first-party'.padStart(13)}${'CSS'.padStart(11)}`,
);
console.log(`  ${'-'.repeat(28)}${'-'.repeat(11)}${'-'.repeat(13)}${'-'.repeat(11)}`);

for (const document of documents) {
  const { js, css } = measure(document);
  const label = relative(APP_DIR, document);
  const firstParty = Math.max(0, js - baselineJs);

  if (js > worst.js) worst = { js, css: worst.css, route: label };
  if (css > worst.css) worst.css = css;

  console.log(
    `  ${label.padEnd(28)}` +
      `${`${(js / KB).toFixed(1)} KB`.padStart(11)}` +
      `${`${(firstParty / KB).toFixed(1)} KB`.padStart(13)}` +
      `${`${(css / KB).toFixed(1)} KB`.padStart(11)}`,
  );
}

const totalKb = worst.js / KB;
const baselineKb = baselineJs / KB;
const firstPartyKb = Math.max(0, worst.js - baselineJs) / KB;
const cssKb = worst.css / KB;

console.log(`\n  Framework floor (Next + React), measured: ${baselineKb.toFixed(1)} KB\n`);

const check = (value, budget, label) =>
  value > budget
    ? fail(`${label} ${value.toFixed(1)} KB exceeds the ${budget} KB budget.`)
    : pass(`${label} ${value.toFixed(1)} KB / ${budget} KB`);

check(totalKb, BUDGETS.totalJs, `Total first-load JS (worst: ${worst.route})`);
check(firstPartyKb, BUDGETS.firstPartyJs, 'First-party JS');
check(cssKb, BUDGETS.css, 'CSS');

console.log('');
if (failed) process.exit(1);
