import { config as dotenvxConfig } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';

import { integrationConfig } from './integration.ts';

const WORKSPACE_ROOT_DIR = join(import.meta.dirname, '..', '..', '..');

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

  console.log(join(WORKSPACE_ROOT_DIR, '.env.test'));
  const loadedEnv = dotenvxConfig({
    path: [join(WORKSPACE_ROOT_DIR, '.env.test'), join(dirname, envFilePath)],
    processEnv: {},
  });

  const env = loadedEnv.parsed ?? {};

  const projectRoot = join(dirname, '..');

  console.log({ env });

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
