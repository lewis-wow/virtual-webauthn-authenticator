import { config as dotenvxConfig } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import { defineConfig, mergeConfig, type UserConfig } from 'vitest/config';

import { integrationConfig } from './integration.js';

export interface IntegrationConfigOptions {
  /**
   * The directory name where this config file is located (use import.meta.dirname)
   */
  dirname: string;

  /**
   * The name of the package/app (typically from package.json)
   */
  name: string;

  /**
   * Path to the .env.test file relative to the config file directory
   * @default '../.env.test'
   */
  envFilePath?: string;

  /**
   * Additional vitest config to merge
   */
  additionalConfig?: UserConfig;
}

/**
 * Creates a standardized vitest integration configuration with dotenvx support.
 * This eliminates duplication across multiple test configuration files.
 *
 * @param options - Configuration options
 * @returns A vitest configuration object
 *
 * @example
 * ```typescript
 * // In __tests__/vitest.integration.config.ts
 * import { createIntegrationConfig } from '@repo/vitest-config/integration-factory';
 * import pkg from '../package.json';
 *
 * export default createIntegrationConfig({
 *   dirname: import.meta.dirname,
 *   name: pkg.name,
 * });
 * ```
 */
export const createIntegrationConfig = ({
  dirname,
  name,
  envFilePath = '../.env.test',
  additionalConfig = {},
}: IntegrationConfigOptions) => {
  // Load environment variables from .env.test file
  const env = dotenvxConfig({
    path: join(dirname, envFilePath),
    override: true,
  }).parsed;

  // Calculate the project root (parent of __tests__ directory)
  const projectRoot = join(dirname, '..');

  return mergeConfig(
    integrationConfig,
    defineConfig({
      test: {
        name,
        env,
        root: projectRoot,
        ...additionalConfig.test,
      },
      ...additionalConfig,
    }),
  );
};
