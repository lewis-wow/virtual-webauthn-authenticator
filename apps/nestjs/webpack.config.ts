import type { Configuration } from 'webpack';

const path = require('path');
const nodeExternals = require('webpack-node-externals');

const config = (
  _env: undefined,
  argv: { mode: 'production' | 'development' | 'none' },
): Configuration => {
  const isProduction = argv.mode === 'production';

  return {
    // 1. Set the entry point to your NestJS main.ts file
    entry: './src/main.ts',

    devtool: isProduction ? 'source-map' : 'eval-source-map',

    // Make sure 'mode' is also set, if not passed via CLI
    mode: isProduction ? 'production' : 'development',

    // 2. Set the target to 'node'
    // This tells Webpack to compile for a Node.js environment
    target: 'node',

    // 3. This is the "just-in-time" magic
    externals: [
      nodeExternals({
        // 4. This is the crucial part for monorepos
        // We want to bundle our internal 'libs' folder,
        // so we tell 'webpack-node-externals' to NOT externalize
        // any modules that start with '@my-monorepo-name'
        allowlist: [/^@repo/],
      }),
    ],

    module: {
      rules: [
        {
          // 5. Use 'ts-loader' to compile your TypeScript
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            // Point to your app-specific tsconfig.json
            configFile: 'tsconfig.build.json',
          },
        },
      ],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      // 6. Optional: Add aliases for your monorepo packages
      // This helps with module resolution
      alias: {
        '@repo/prisma': path.resolve(__dirname, '../../packages/prisma/src'),
      },
    },

    // 7. Define the output bundle
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },

    // 8. Optional: Set mode
    // mode: 'production',
  };
};

module.exports = config;
