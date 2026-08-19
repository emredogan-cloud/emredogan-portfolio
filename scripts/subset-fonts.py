#!/usr/bin/env python3
"""Subset the Geist variable faces to the characters this site can render.

**Run by hand, not by the build.** It needs `fonttools[woff]`, which is a
Python dependency this project does not otherwise have, and its output is two
binary files that belong in version control — a build that regenerated them
every time would produce a different bundle hash on every machine.

    python3 -m venv .venv && .venv/bin/pip install 'fonttools[woff]'
    .venv/bin/python scripts/subset-fonts.py

Why at all: the published `geist` package ships full faces — 728 and 889
mapped glyphs including Cyrillic, Greek and box-drawing — for a site written
in English with Turkish proper nouns. Both are preloaded, so that was 141 KB
on the critical path against a 120 KB budget.

The subset is the union of two things:

  1. The standard Google-Fonts `latin` and `latin-ext` unicode ranges, so
     ordinary future edits cannot fall outside it.
  2. Every character that actually appears in the prerendered HTML, which
     catches anything the ranges miss — a typographic dash, a currency mark,
     an arrow someone pastes into content.

`tests/unit/fonts.test.ts` re-derives (2) from the current build and fails if a
character is rendered that the subset does not cover, so the two cannot drift.
"""

from __future__ import annotations

import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src/assets/fonts"
BUILD = ROOT / ".next/server/app"

SOURCES = {
    "Geist-Variable": "node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
    "GeistMono-Variable": "node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
}

# Google Fonts' own definitions, so the subset matches what every other
# self-hosted latin/latin-ext face covers.
LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,"
    "U+2212,U+2215,U+FEFF,U+FFFD"
)
LATIN_EXT = (
    "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,"
    "U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,"
    "U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
)

TAG = re.compile(r"<[^>]+>")
ENTITY = re.compile(r"&#(\d+);|&#x([0-9a-fA-F]+);")


def rendered_characters() -> set[str]:
    """Every character the built pages actually put on screen."""
    if not BUILD.exists():
        sys.exit("No build found. Run `pnpm build` first.")

    seen: set[str] = set()
    for page in BUILD.rglob("*.html"):
        text = page.read_text(encoding="utf-8", errors="ignore")
        text = TAG.sub(" ", text)
        text = ENTITY.sub(lambda m: chr(int(m.group(1) or m.group(2), 10 if m.group(1) else 16)), text)
        seen.update(text)
    return {c for c in seen if c.isprintable() and not c.isspace()}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    used = rendered_characters()
    print(f"{len(used)} distinct characters rendered across the built pages")

    manifest: dict[str, list[str]] = {"characters": sorted(used)}
    (OUT / "coverage.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n")

    for name, source in SOURCES.items():
        src = ROOT / source
        dest = OUT / f"{name}.subset.woff2"
        before = src.stat().st_size
        subprocess.run(
            [
                sys.executable, "-m", "fontTools.subset", str(src),
                f"--output-file={dest}",
                f"--unicodes={LATIN},{LATIN_EXT}",
                "--text=" + "".join(sorted(used)),
                "--flavor=woff2",
                # **Every** layout feature, and hinting left alone.
                #
                # The first version passed `--layout-features=kern,liga,calt,tnum`
                # and `--no-hinting`, which is the usual advice and was wrong
                # here: it changed how text rasterised, and forty-one visual
                # baselines moved. A subset is supposed to remove glyphs
                # nobody needs, not change how the remaining ones look. Keeping
                # the tables costs a few kilobytes and buys identical output.
                "--layout-features=*",
                "--drop-tables+=DSIG",
            ],
            check=True,
        )
        after = dest.stat().st_size
        print(f"{name}: {before / 1024:.1f} KB → {after / 1024:.1f} KB "
              f"({100 - after * 100 / before:.0f}% smaller)")


if __name__ == "__main__":
    main()
