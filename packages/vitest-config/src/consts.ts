export const COVERAGE_EXCLUDE = [
  '**/node_modules/**',
  '**/.pnpm/**',
  '**/dist/**',

  // Tests
  '**/__tests__/**',

  // Barrel files
  '**/index.{ts,tsx}',

  // Generated files
  '**/src/generated/**',

  // React
  '**/*.{tsx,jsx}',

  // Config packages
  '**/packages/vitest-config/**',
  '**/packages/eslint-config/**',
  '**/packages/typescript-config/**',
  '**/packages/rollup-config/**',

  // TypeScript only
  '**/packages/shared-dts/**',
  '**/types/**',
];
