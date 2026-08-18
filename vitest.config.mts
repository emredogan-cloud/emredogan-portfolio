import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**', 'src/content/**'],
      exclude: [
        '**/*.d.ts',
        // `next/font` cannot be imported outside the Next build, so this
        // module is unreachable from jsdom. Its real contract — that the
        // declared CSS variables match the ones `tokens.css` consumes, and
        // that Turkish glyphs come from the loaded face rather than a
        // fallback — is covered by `tests/unit/fonts.test.ts` (source diff)
        // and `tests/e2e/typography.spec.ts` (measured in a browser).
        'src/lib/fonts.ts',
      ],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});
