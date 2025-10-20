import commonjs from '@rollup/plugin-commonjs';
import esmShim from '@rollup/plugin-esm-shim';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import run from '@rollup/plugin-run';
import swc from '@rollup/plugin-swc';
import { defineConfig } from 'rollup';
import del from 'rollup-plugin-delete';
import execute from 'rollup-plugin-execute';
import externals from 'rollup-plugin-node-externals';
import tsconfigPaths from 'rollup-plugin-tsconfig-paths';

// A helper to determine if we are in watch mode
const isWatching = process.env.ROLLUP_WATCH === 'true';

export default defineConfig({
  input: 'src/index.ts',

  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
  },

  onwarn(warning, warn) {
    // Suppress circular dependency warnings from Kysely
    if (
      warning.code === 'CIRCULAR_DEPENDENCY' &&
      warning.message.includes('kysely')
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
      devDependencies: true,
    }),

    // Resolve tsconfig path aliases (e.g., @/components/*)
    tsconfigPaths(),

    // Resolve third-party modules from node_modules that ARE NOT external
    nodeResolve({
      extensions: ['.ts', '.js', '.mjs', '.json', '.node'],
    }),

    // Convert CommonJS modules to ES modules
    commonjs(),

    esmShim(),

    // Allow importing JSON files
    json(),

    // Transpile TypeScript with SWC.
    // `exclude: []` is still necessary to ensure it transpiles the
    // @repo/* packages, which are symlinked inside node_modules.
    swc({
      exclude: [],
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false, // Set to true if you have React components
        },
        target: 'es2022',
      },
      sourceMaps: true,
    }),

    execute('scripts/generate-openapi-spec.ts'),

    isWatching && run(),
  ],
});
