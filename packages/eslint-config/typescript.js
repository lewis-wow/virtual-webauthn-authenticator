import tseslint from 'typescript-eslint';

/**
 * Creates a common TypeScript ESLint configuration used across the monorepo.
 * This eliminates duplication between Next.js, NestJS, and other TypeScript configs.
 *
 * @param {object} options - Configuration options
 * @param {string[]} options.files - File patterns to apply the config to (default: ['**\/*.ts', '**\/*.tsx'])
 * @param {object} options.additionalRules - Additional rules to merge with the default rules
 * @returns {import("eslint").Linter.Config[]} ESLint configuration array
 */
export const createTypeScriptConfig = ({
  files = ['**/*.ts', '**/*.tsx'],
  additionalRules = {},
} = {}) => {
  return tseslint.config({
    files,
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
      ...additionalRules,
    },
  });
};
