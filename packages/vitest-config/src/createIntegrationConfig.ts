import { config as dotenvxConfig } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';

import { integrationConfig } from './integration.ts';

export type IntegrationConfigArgs = {
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
  additionalConfig?: ViteUserConfig;
};

export const createIntegrationConfig = ({
  dirname,
  name,
  envFilePath = '../.env.test',
  additionalConfig = {},
}: IntegrationConfigArgs) => {
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
