import globals from 'globals';

import { config as baseConfig } from './base.js';
import { createTypeScriptConfig } from './typescript.js';

/**
 * A custom ESLint configuration for libraries that use Nest.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
  ...createTypeScriptConfig(),
];
