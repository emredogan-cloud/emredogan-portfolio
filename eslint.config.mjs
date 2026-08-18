import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'out/**',
      'playwright-report/**',
      'test-results/**',
      '.lighthouseci/**',
      'next-env.d.ts',
      '**/*-snapshots/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Registers the Next.js, React and jsx-a11y plugins plus the core-web-vitals rules.
  ...nextCoreWebVitals,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // jsx-a11y is already registered by the Next config, so the recommended
      // set is merged by name rather than by re-registering the plugin.
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  // Type-aware rules. Scoped to first-party source so the type service is only
  // spun up where it earns its cost, and with the TS parser explicitly set
  // because the Next config installs its own.
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },
  {
    // Tests and build scripts report to a terminal; stdout is their interface.
    files: ['tests/**/*.{ts,tsx}', 'scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
);
