import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';

import { config as baseConfig } from './base.js';
import { createTypeScriptConfig } from './typescript.js';

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
  ...createTypeScriptConfig(),
];
