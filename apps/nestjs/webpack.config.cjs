/* eslint-disable @typescript-eslint/no-require-imports */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  node: {
    // required for __dirname to properly resolve
    // Also required for `bull` to work, see https://github.com/OptimalBits/bull/issues/811
    __dirname: true,
  },
  devtool: 'source-map',
  output: {
    // Use [name] placeholder to preserve file names and paths
    filename: '[name].js',
    // Define the output directory
    path: path.resolve(__dirname, 'dist'),
    // Clean the output directory before each build
    clean: true,
  },
  externals: [
    nodeExternals({
      allowlist: [/^@repo/],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: (_) =>
          /node_modules/.test(_) && !/node_modules\\\/(@repo)/.test(_),
        use: {
          loader: 'swc-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
    plugins: [new TsconfigPathsPlugin()],
  },
};
