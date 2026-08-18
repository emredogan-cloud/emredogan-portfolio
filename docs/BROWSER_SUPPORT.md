# Browser support matrix

Last reviewed: 2026-08-18 (Phase 1).

## Tier 1 — fully supported, tested in CI on every pull request

| Engine                                | Versions     | How it is verified                       |
| ------------------------------------- | ------------ | ---------------------------------------- |
| Chromium (Chrome, Edge, Brave, Opera) | last 2 major | Playwright E2E + axe + visual regression |
| Gecko (Firefox)                       | last 2 major | Playwright E2E + axe                     |
| WebKit (Safari macOS/iOS)             | Safari 17+   | Playwright E2E + axe                     |

Visual-regression baselines are captured on Chromium only. Rendering
differences between engines are expected and are documented in Phase 13 rather
than snapshotted three times, which would make every intentional design change
a three-way baseline update.

## Tier 2 — expected to work, spot-checked manually

Samsung Internet (last 2), Chrome on Android (last 2), Safari on iPadOS (17+).

## Tier 3 — content remains readable, enhancements degrade

- **JavaScript disabled.** Every route is statically prerendered, so all
  content and in-page navigation work. Motion and the animated background do
  not run.
- **No Canvas 2D context.** The background falls back to a static CSS gradient.
- **`prefers-reduced-motion: reduce`.** Meteors stop, the marquee stops,
  reveals resolve instantly. No information is lost.
- **`forced-colors: active`** (Windows High Contrast). Gradient text falls back
  to a solid system colour — `background-clip: text` is unsupported there and
  would otherwise render the word invisible.

## Not supported

Internet Explorer, and any browser without support for CSS custom properties,
`color-mix()`, or ES2022. No polyfills are shipped for these.

## Platform features and their fallbacks

| Feature                         | Used for                           | Fallback                          |
| ------------------------------- | ---------------------------------- | --------------------------------- |
| `color-mix()`                   | Translucent surfaces and hairlines | Baseline in all Tier 1 engines    |
| `backdrop-filter`               | Navigation island, glass cards     | Opaque surface token              |
| `animation-timeline: scroll()`  | Scroll progress bar                | JS-driven progress                |
| `text-wrap: balance` / `pretty` | Headline and paragraph ragging     | Normal wrapping                   |
| `dvh` units                     | Full-height sections on mobile     | `vh`                              |
| AVIF                            | Images                             | WebP, then JPEG, via `next/image` |

## Known local limitation

Running the WebKit suite on a Linux workstation requires the system package
`libevent-2.1-7t64`:

```bash
sudo apt-get install libevent-2.1-7t64
# or: sudo pnpm exec playwright install-deps
```

CI installs it automatically (`playwright install --with-deps`), so WebKit is
always covered on pull requests even when it cannot run locally.
