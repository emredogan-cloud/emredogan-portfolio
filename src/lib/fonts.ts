import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

/**
 * Self-hosted variable faces via `next/font`, so there is no network request
 * for typography and therefore no font-driven layout shift.
 *
 * Geist covers Latin and Latin Extended, which includes the Turkish glyphs
 * (ı İ ş ğ ç ö ü) that appear in the founder's name and in Turkish-market
 * project names. Verified by `tests/unit/fonts.test.ts` and by the typography
 * visual snapshot.
 */
export const fontVariables = `${GeistSans.variable} ${GeistMono.variable}`;
