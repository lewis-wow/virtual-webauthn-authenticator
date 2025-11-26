import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Assuming you share this base config across the monorepo
// If it is in a parent folder, adjust path: '../../base.js'
import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for Next.js apps.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Required for React/Next client components
        ...globals.node, // Required for Next.js Server Actions/Components
      },
    },
    plugins: {
      '@next/next': nextPlugin,
    },
  },
  ...tseslint.config({
    files: ['**/*.ts', '**/*.tsx'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        project: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  }),
];
