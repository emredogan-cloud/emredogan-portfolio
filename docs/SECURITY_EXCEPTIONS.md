# Security exceptions

Every advisory suppressed in `package.json` → `pnpm.auditConfig.ignoreGhsas`
is listed here with its reason and a review date. An entry with no
justification is a bug in this file, not a licence to ignore the advisory.

Reviewed: **2026-08-18** (Phase 1).

---

## GHSA-jmr9-qjv8-65gv — `extract-zip` unvalidated symlink path traversal

|                   |                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------- |
| Severity          | High (CVE-2026-56876)                                                                 |
| Affected          | `extract-zip <= 2.0.1`                                                                |
| Patched           | **None published.** 2.0.1 is the latest release and is the vulnerable one.            |
| Reached via       | `@lhci/cli` → `lighthouse` → `puppeteer-core` → `@puppeteer/browsers` → `extract-zip` |
| Shipped to users? | No. `@lhci/cli` is a devDependency and is never installed in a production build.      |

**Why it is accepted.** There is no version to upgrade to. The only code path
is Puppeteer unpacking a Chrome build downloaded from Google's own CDN during a
CI run, on an ephemeral runner, from a source we already trust to execute a
browser binary. Exploiting it would require compromising that CDN, at which
point the zip is the least of the problems.

**Why it is not removed instead.** Lighthouse CI is what enforces the
performance budget. Dropping it to clear an advisory in a CI-only dependency
would trade a real, continuously-enforced guarantee for a cosmetic one.

**Exit condition.** Remove this entry as soon as `extract-zip` publishes a
patched version, or `@lhci/cli` stops depending on it. Re-checked on every
`@lhci/cli` upgrade.

---

## Fixed rather than suppressed

| Advisory                             | Package | Resolution                                                                                                |
| ------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------- |
| GHSA-ph9p-34f9-6g65 (CVE-2026-44705) | `tmp`   | `pnpm.overrides` forces `^0.2.7`; the transitive range from `@lhci/cli` resolved to a vulnerable version. |
