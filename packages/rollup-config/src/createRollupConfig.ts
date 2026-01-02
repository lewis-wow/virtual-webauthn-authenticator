import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import run from '@rollup/plugin-run';
import swc from '@rollup/plugin-swc';
import { defineConfig } from 'rollup';
import del from 'rollup-plugin-delete';
import externals from 'rollup-plugin-node-externals';
import tsconfigPaths from 'rollup-plugin-tsconfig-paths';

// import esmShim from '@rollup/plugin-esm-shim';

export type JscTarget =
  | 'es3'
  | 'es5'
  | 'es2015'
  | 'es2016'
  | 'es2017'
  | 'es2018'
  | 'es2019'
  | 'es2020'
  | 'es2021'
  | 'es2022'
  | 'es2023'
  | 'es2024'
  | 'esnext';

export type CreateRollupConfigArgs = {
  input?: string;
  tsx?: boolean;
  target?: JscTarget;
};

export const createRollupConfig = (config: CreateRollupConfigArgs) => {
  const { input = 'src/index.ts', tsx = false, target = 'es2022' } = config;

  // A helper to determine if we are in watch mode
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const isWatching = process.env.ROLLUP_WATCH === 'true';

  return defineConfig({
    input,

    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      entryFileNames: '[name].js',
      chunkFileNames: '[name]-[hash].js',
    },

    onwarn(warning, warn) {
      // Suppress circular dependency warnings originating from node_modules
      if (
        warning.code === 'CIRCULAR_DEPENDENCY' &&
        warning.message.includes('node_modules')
      ) {
        return;
      }

      // Use the default Rollup warning handler for all other warnings
      warn(warning);
    },

    plugins: [
      del({ targets: 'dist/*' }),

      // Use `exclude` to PREVENT @repo/* from being marked as external.
      // This tells Rollup to bundle these packages.
      externals({
        exclude: [/@repo\/.*/],
        devDeps: true,
      }),

      // Resolve tsconfig path aliases (e.g., @/components/*)
      tsconfigPaths(),

      // Resolve third-party modules from node_modules that ARE NOT external
      nodeResolve({
        extensions: ['.ts', '.js', '.mjs', '.json', '.node'],
      }),

      // Convert CommonJS modules to ES modules
      commonjs(),

      // Allow importing JSON files
      json(),

      // Transpile TypeScript with SWC.
      // `exclude: []` is still necessary to ensure it transpiles the
      // @repo/* packages, which are symlinked inside node_modules.
      swc({
        exclude: [],
        swc: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx,
            },
            target,
          },
          sourceMaps: true,
        },
      }),

      isWatching &&
        run({
          execArgv: ['--enable-source-maps'],
        }),
    ],
  });
};
